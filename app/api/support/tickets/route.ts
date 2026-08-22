import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get user's tickets with messages
    const tickets = await query(`
      SELECT 
        t.id,
        t.reason,
        t.subject,
        t.description,
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
      WHERE t.user_id = $1
      GROUP BY t.id
      ORDER BY t.updated_at DESC
    `, [user.id])

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

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

    const { reason, subject, description } = await request.json()

    if (!reason || !subject || !description) {
      return NextResponse.json(
        { error: 'Reason, subject, and description are required' },
        { status: 400 }
      )
    }

    // Create new ticket
    const result = await query(`
      INSERT INTO yar_support_tickets (user_id, reason, subject, description, status)
      VALUES ($1, $2, $3, $4, 'open')
      RETURNING id, reason, subject, description, status, created_at, updated_at
    `, [user.id, reason, subject, description])

    const ticket = result[0]
    ticket.messages = []

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { ticketId, status } = await request.json()

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'Ticket ID and status are required' },
        { status: 400 }
      )
    }

    // Update ticket status
    const result = await query(`
      UPDATE yar_support_tickets
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING id, reason, subject, description, status, created_at, updated_at
    `, [status, ticketId, user.id])

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket: result[0] })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
