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

    const { contentId, comment } = await request.json()

    if (!contentId || !comment) {
      return NextResponse.json(
        { error: 'Content ID and comment are required' },
        { status: 400 }
      )
    }

    // Insert comment
    const result = await query(`
      INSERT INTO yar_video_comments (content_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING id, comment, created_at
    `, [contentId, user.id, comment])

    const newComment = {
      ...result[0],
      user_name: user.name
    }

    return NextResponse.json({ comment: newComment })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
