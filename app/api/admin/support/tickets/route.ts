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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all tickets with user info and messages
    const tickets = await query(`
      SELECT 
        t.id,
        t.subject,
        t.status,
        t.created_at,
        t.updated_at,
        u.name as user_name,
        u.email as user_email,
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
      JOIN yar_users u ON t.user_id = u.id
      LEFT JOIN yar_support_messages m ON t.id = m.ticket_id
      GROUP BY t.id, u.name, u.email
      ORDER BY t.updated_at DESC
    `)

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get admin tickets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}
