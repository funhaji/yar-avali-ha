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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { ticketId, message } = await request.json()

    if (!ticketId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Add admin message to ticket
    const newMessage = await query(`
      INSERT INTO yar_support_messages (ticket_id, user_id, message, is_admin)
      VALUES ($1, $2, $3, true)
      RETURNING id, ticket_id, message, is_admin, created_at
    `, [ticketId, user.id, message.trim()])

    // Update ticket timestamp
    await query(`
      UPDATE yar_support_tickets 
      SET updated_at = NOW()
      WHERE id = $1
    `, [ticketId])

    return NextResponse.json({ message: newMessage[0] })
  } catch (error) {
    console.error('Send admin message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
