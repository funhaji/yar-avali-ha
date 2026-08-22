import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { getPixeldrainUrl } from '@/lib/video'
import VideoPlayer from '@/components/VideoPlayer'
import SecurePDFViewerCanvas from '@/components/SecurePDFViewerCanvas'
import { VideoComments } from '@/components/VideoComments'
import { ArrowRight, Lock, Play, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react'

async function getContentData(contentId: string, userId: string) {
  // Get content details
  const content = await query(`
    SELECT * FROM yar_content_items WHERE id = $1 AND published = true
  `, [contentId])
  
  if (content.length === 0) {
    return null
  }
  
  const item = content[0]
  
  // Check access
  let hasAccess = item.tier_requirement === 'free' || item.content_type === 'pdf' || item.content_type === 'image'
  if (!hasAccess) {
    hasAccess = await hasActiveSubscription(userId)
  }
  
  // Get viewing progress
  const progress = await query(`
    SELECT progress_seconds FROM yar_viewing_history 
    WHERE user_id = $1 AND content_id = $2
  `, [userId, contentId])
  
  const lastPosition = progress.length > 0 ? progress[0].progress_seconds : 0
  
  // Get video/PDF URL based on storage provider
  let directVideoUrl = ''
  const storageProvider = item.storage_provider || 'pixeldrain'
  
  // Handle PDF and image content types specifically
  if (item.content_type === 'pdf' || item.content_type === 'image') {
    // For PDFs and images, prioritize direct URL or video_url field
    directVideoUrl = item.video_url || item.pdf_url || item.file_url || ''
    
    // Handle Google Drive PDFs/images
    if (item.gdrive_id) {
      if (item.content_type === 'pdf') {
        directVideoUrl = `https://drive.google.com/file/d/${item.gdrive_id}/preview`
      } else {
        // For images, use direct download link
        directVideoUrl = `https://drive.google.com/uc?export=view&id=${item.gdrive_id}`
      }
    }
  } else {
    // Handle video content
    switch (storageProvider) {
      case 'pixeldrain':
        directVideoUrl = item.pixeldrain_id ? getPixeldrainUrl(item.pixeldrain_id) : ''
        break
      case 'youtube':
        directVideoUrl = item.video_url || ''
        break
      case 'gdrive':
        directVideoUrl = item.gdrive_id || item.video_url || ''
        break
      case 'mega':
        directVideoUrl = item.video_url || ''
        break
      case 'direct':
        directVideoUrl = item.video_url || ''
        break
      default:
        directVideoUrl = item.video_url || ''
    }
  }
  
  // Get related content (same category or series)
  let related = []
  if (item.series_title) {
    related = await query(`
      SELECT id, title, thumbnail_url, episode_number
      FROM yar_content_items
      WHERE series_title = $1 AND id != $2 AND published = true
      ORDER BY episode_number
      LIMIT 6
    `, [item.series_title, contentId])
  } else if (item.category) {
    related = await query(`
      SELECT id, title, thumbnail_url
      FROM yar_content_items
      WHERE category = $1 AND id != $2 AND published = true
      ORDER BY view_count DESC
      LIMIT 6
    `, [item.category, contentId])
  }
  
  // Get comments
  const comments = await query(`
    SELECT 
      c.id,
      c.comment,
      c.created_at,
      u.name as user_name
    FROM yar_video_comments c
    JOIN yar_users u ON c.user_id = u.id
    WHERE c.content_id = $1
    ORDER BY c.created_at DESC
  `, [contentId])
  
  return {
    content: item,
    hasAccess,
    lastPosition,
    storageProvider,
    directVideoUrl,
    related,
    comments
  }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userName = headersList.get('x-user-name')
  
  if (!userId) {
    return (
      <div className="page bg-cream flex items-center justify-center">
        <div className="card max-w-sm p-8 text-center shadow-lg">
          <h1 className="font-bold text-2xl mb-4">لطفاً وارد شوید</h1>
          <Link href="/login" className="button button-primary">
            ورود به حساب کاربری
          </Link>
        </div>
      </div>
    )
  }
  
  const data = await getContentData(id, userId)
  
  if (!data) {
    return (
      <div className="page bg-cream flex items-center justify-center">
        <div className="card max-w-sm p-8 text-center shadow-lg">
          <h1 className="font-bold text-2xl mb-4">محتوا یافت نشد</h1>
          <Link href="/dashboard" className="button button-primary">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    )
  }
  
  const { content, hasAccess, lastPosition, storageProvider, directVideoUrl, related, comments } = data
  
  return (
    <div className="page bg-ink text-paper" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-ink/90 backdrop-blur-md sticky top-0 z-50">
        <nav className="shell py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-paper/80 hover:text-paper font-bold transition-colors">
            <ArrowRight className="w-5 h-5" />
            بازگشت به داشبورد
          </Link>
          <div className="text-paper/60 text-sm font-medium bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            {userName}
          </div>
        </nav>
      </header>

      {!hasAccess ? (
        // Access denied - show upgrade prompt
        <div className="shell section flex items-center justify-center min-h-[70vh]">
          <div className="card bg-ink-soft/20 border border-white/10 p-10 text-center max-w-md backdrop-blur-sm slide-up">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Lock className="w-10 h-10 text-tangerine" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              این محتوا نیاز به اشتراک دارد
            </h1>
            <p className="text-paper/70 mb-8 leading-relaxed">
              برای تماشای این محتوا و دسترسی نامحدود به تمام بخش‌های پلتفرم، باید اشتراک تهیه کنید.
            </p>
            <Link
              href="/subscription"
              className="button button-primary button-lg w-full justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
            >
              مشاهده پلن‌های اشتراک
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content Area */}
          <div className={content.content_type === 'pdf' ? 'bg-ink border-b border-white/10' : 'bg-black/40 border-b border-white/10'}>
            <div className="shell max-w-[1400px] mx-auto">
              <div className={`w-full relative overflow-hidden shadow-2xl ${content.content_type === 'pdf' ? 'rounded-b-xl' : 'aspect-video bg-black rounded-b-2xl'}`} style={content.content_type === 'pdf' ? { height: 'calc(100vh - 80px)' } : undefined}>
                {content.content_type === 'pdf' ? (
                  <SecurePDFViewerCanvas
                    pdfUrl={directVideoUrl}
                    title={content.title}
                  />
                ) : content.content_type === 'image' ? (
                  <div className="w-full h-full p-4 flex items-center justify-center bg-black">
                    <img 
                      src={directVideoUrl} 
                      alt={content.title}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      style={{ 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'none'
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                ) : (
                  <VideoPlayer
                    contentId={id}
                    storageProvider={storageProvider}
                    videoUrl={directVideoUrl}
                    startPosition={lastPosition}
                    title={content.title}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="shell py-12">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main Info Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title & Meta */}
                <div className="slide-up">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {content.category && (
                      <span className="bg-white/10 text-paper/90 px-3 py-1 rounded-full text-sm font-bold border border-white/10">
                        {content.category}
                      </span>
                    )}
                    {content.content_type === 'pdf' ? (
                      <span className="flex items-center gap-1.5 text-tangerine bg-tangerine/10 px-3 py-1 rounded-full text-sm font-bold border border-tangerine/20">
                        <FileText className="w-4 h-4" /> فایل PDF
                      </span>
                    ) : content.content_type === 'image' ? (
                      <span className="flex items-center gap-1.5 text-sky bg-sky/10 px-3 py-1 rounded-full text-sm font-bold border border-sky/20">
                        <ImageIcon className="w-4 h-4" /> تصویر
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-teal bg-teal/10 px-3 py-1 rounded-full text-sm font-bold border border-teal/20">
                        <Play className="w-4 h-4" /> ویدیو
                      </span>
                    )}
                    {content.duration_seconds && content.content_type !== 'pdf' && content.content_type !== 'image' && (
                      <span className="text-paper/60 text-sm font-medium">
                        {Math.floor(content.duration_seconds / 60)} دقیقه
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">{content.title}</h1>
                  
                  {content.series_title && (
                    <div className="text-teal text-lg font-bold mb-4">
                      مجموعه: {content.series_title} {content.episode_number ? `(قسمت ${content.episode_number})` : ''}
                    </div>
                  )}
                  
                  {content.description && (
                    <p className="text-paper/80 leading-relaxed text-lg bg-white/5 p-6 rounded-2xl border border-white/10">
                      {content.description}
                    </p>
                  )}
                </div>

                {/* Comments Section */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8 slide-up" style={{ animationDelay: '0.1s' }}>
                  <VideoComments contentId={id} initialComments={comments} />
                </div>
              </div>

              {/* Sidebar: Related Content */}
              <div className="space-y-6 slide-up" style={{ animationDelay: '0.2s' }}>
                {related.length > 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Play className="w-5 h-5 text-teal" /> 
                      {content.series_title ? 'سایر قسمت‌ها' : 'محتوای مرتبط'}
                    </h2>
                    
                    <div className="flex flex-col gap-4">
                      {related.map((item: any) => (
                        <Link
                          key={item.id}
                          href={`/watch/${item.id}`}
                          className="group flex gap-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="w-28 h-20 rounded-lg overflow-hidden shrink-0 relative bg-ink-soft">
                            {item.thumbnail_url ? (
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-6 h-6 text-paper/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          </div>
                          
                          <div className="flex flex-col justify-center">
                            <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-teal transition-colors">
                              {item.episode_number && <span className="text-teal ml-1">قسمت {item.episode_number} -</span>}
                              {item.title}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
