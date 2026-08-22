import { NextRequest, NextResponse } from 'next/server'
import { verifyVideoToken, getPixeldrainUrl, getR2SignedUrl, getGoogleDriveUrl } from '@/lib/video'
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
      SELECT * FROM yar_content_items WHERE id = $1
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
    
    // Get video URL based on storage provider
    let videoUrl: string | null = null
    const storageProvider = item.storage_provider || 'pixeldrain'
    
    console.log('[Watch API] Content ID:', contentId)
    console.log('[Watch API] Storage Provider:', storageProvider)
    console.log('[Watch API] Item data:', {
      pixeldrain_id: item.pixeldrain_id,
      r2_key: item.r2_key,
      gdrive_id: item.gdrive_id,
      video_url: item.video_url
    })
    
    switch (storageProvider) {
      case 'pixeldrain':
        if (item.pixeldrain_id) {
          videoUrl = getPixeldrainUrl(item.pixeldrain_id)
          console.log('[Watch API] Pixeldrain URL:', videoUrl)
        }
        break
      
      case 'r2':
        if (item.r2_key) {
          videoUrl = await getR2SignedUrl(item.r2_key, 3600) // 1 hour expiry
          console.log('[Watch API] R2 URL generated:', videoUrl ? 'Yes' : 'No')
        }
        break
      
      case 'gdrive':
        if (item.gdrive_id) {
          videoUrl = getGoogleDriveUrl(item.gdrive_id)
          console.log('[Watch API] Google Drive URL:', videoUrl)
        }
        break
      
      case 'direct':
        videoUrl = item.video_url
        console.log('[Watch API] Direct URL:', videoUrl)
        break
      
      case 'youtube':
        // YouTube videos cannot be played through standard video tag
        // Return error asking user to use iframe-based player
        console.log('[Watch API] YouTube URL:', item.video_url)
        return NextResponse.json(
          { error: 'ویدیوهای YouTube از طریق این روش قابل پخش نیستند. لطفاً از پخش‌کننده یوتیوب استفاده کنید.' },
          { status: 400 }
        )
      
      default:
        // Fallback to direct URL or pixeldrain
        videoUrl = item.video_url || (item.pixeldrain_id ? getPixeldrainUrl(item.pixeldrain_id) : null)
        console.log('[Watch API] Fallback URL:', videoUrl)
    }
    
    if (!videoUrl) {
      console.log('[Watch API] No video URL found for storage provider:', storageProvider)
      return NextResponse.json(
        { error: `لینک ویدیو یافت نشد (نوع منبع: ${storageProvider})` },
        { status: 404 }
      )
    }
    
    console.log('[Watch API] Final redirect URL:', videoUrl)
    
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
