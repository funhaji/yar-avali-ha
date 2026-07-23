import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'احراز هویت نشده' },
        { status: 401 }
      )
    }
    
    const { contentId, progress, completed } = await request.json()
    
    if (!contentId || progress === undefined) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      )
    }
    
    // Update or insert viewing history
    await query(`
      INSERT INTO viewing_history (user_id, content_id, progress_seconds, completed, last_watched_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, content_id)
      DO UPDATE SET
        progress_seconds = $3,
        completed = $4,
        last_watched_at = NOW()
    `, [userId, contentId, progress, completed || false])
    
    // Increment view count if this is the first time or if completed
    if (progress < 30 || completed) {
      await query(`
        UPDATE content_items
        SET view_count = view_count + 1
        WHERE id = $1
      `, [contentId])
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Progress error:', error)
    return NextResponse.json(
      { error: 'خطای سرور رخ داد' },
      { status: 500 }
    )
  }
}
