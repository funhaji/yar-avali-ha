import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { ticketId, message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let currentTicketId = ticketId

    // If no ticket exists, create one
    if (!currentTicketId) {
      const newTicket = await query(`
        INSERT INTO yar_support_tickets (user_id, subject, status)
        VALUES ($1, $2, 'open')
        RETURNING id, subject, status, created_at, updated_at
      `, [user.id, 'پشتیبانی'])

      currentTicketId = newTicket[0].id
    }

    // Add message to ticket
    const newMessage = await query(`
      INSERT INTO yar_support_messages (ticket_id, user_id, message, is_admin)
      VALUES ($1, $2, $3, false)
      RETURNING id, ticket_id, message, is_admin, created_at
    `, [currentTicketId, user.id, message.trim()])

    // Update ticket timestamp
    await query(`
      UPDATE yar_support_tickets 
      SET updated_at = NOW()
      WHERE id = $1
    `, [currentTicketId])

    // If this is a new ticket, return the full ticket info
    if (!ticketId) {
      const ticketWithMessages = await query(`
        SELECT 
          t.id,
          t.subject,
          t.status,
          t.created_at,
          t.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', m.id,
                'message', m.message,
                'is_admin', m.is_admin,
                'created_at', m.created_at
              ) ORDER BY m.created_at ASC
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'
          ) as messages
        FROM yar_support_tickets t
        LEFT JOIN yar_support_messages m ON t.id = m.ticket_id
        WHERE t.id = $1
        GROUP BY t.id
      `, [currentTicketId])

      return NextResponse.json({ 
        ticket: ticketWithMessages[0],
        message: newMessage[0]
      })
    }

    return NextResponse.json({ message: newMessage[0] })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
