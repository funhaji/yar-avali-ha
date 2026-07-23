import { NextRequest, NextResponse } from 'next/server'
import { verifyVideoToken } from '@/lib/video'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // Verify token
    const verification = verifyVideoToken(token)
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'توکن نامعتبر یا منقضی شده است' },
        { status: 403 }
      )
    }
    
    const { contentId, userId } = verification
    
    if (!contentId || !userId) {
      return NextResponse.json(
        { error: 'اطلاعات توکن ناقص است' },
        { status: 400 }
      )
    }
    
    // Get content details
    const content = await query(`
      SELECT * FROM content_items WHERE id = $1
    `, [contentId])
    
    if (content.length === 0) {
      return NextResponse.json(
        { error: 'محتوا یافت نشد' },
        { status: 404 }
      )
    }
    
    const item = content[0]
    
    // Check access rights
    if (item.tier_requirement !== 'free') {
      const hasAccess = await hasActiveSubscription(userId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'برای دسترسی به این محتوا نیاز به اشتراک دارید' },
          { status: 403 }
        )
      }
    }
    
    // Get video URL (Pixeldrain or direct URL)
    let videoUrl = item.video_url
    if (item.pixeldrain_id) {
      videoUrl = `https://pixeldrain.com/api/file/${item.pixeldrain_id}`
    }
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'لینک ویدیو یافت نشد' },
        { status: 404 }
      )
    }
    
    // Redirect to actual video URL
    return NextResponse.redirect(videoUrl)
    
  } catch (error: any) {
    console.error('Watch error:', error)
    return NextResponse.json(
      { error: 'خطای سرور رخ داد' },
      { status: 500 }
    )
  }
}
