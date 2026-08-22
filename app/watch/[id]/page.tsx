import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { getPixeldrainUrl } from '@/lib/video'
import VideoPlayer from '@/components/VideoPlayer'
import SecurePDFViewer from '@/components/SecurePDFViewer'
import { VideoComments } from '@/components/VideoComments'
import { ArrowRight, Lock, Play, FileText, Image as ImageIcon } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'

async function getContentData(contentId: string, userId: string) {
  const content = await query(`SELECT * FROM yar_content_items WHERE id = $1 AND published = true`, [contentId])
  if (content.length === 0) return null
  const item = content[0]
  
  let hasAccess = item.tier_requirement === 'free' || item.content_type === 'pdf' || item.content_type === 'image'
  if (!hasAccess) hasAccess = await hasActiveSubscription(userId)
  
  const progress = await query(`SELECT progress_seconds FROM yar_viewing_history WHERE user_id = $1 AND content_id = $2`, [userId, contentId])
  const lastPosition = progress.length > 0 ? progress[0].progress_seconds : 0
  
  let directVideoUrl = ''
  const storageProvider = item.storage_provider || 'pixeldrain'
  
  if (item.content_type === 'pdf' || item.content_type === 'image') {
    directVideoUrl = item.video_url || item.pdf_url || item.file_url || ''
    if (item.gdrive_id) {
      if (item.content_type === 'pdf') {
        directVideoUrl = `https://drive.google.com/file/d/${item.gdrive_id}/preview`
      } else {
        directVideoUrl = `https://drive.google.com/uc?export=view&id=${item.gdrive_id}`
      }
    }
  } else {
    switch (storageProvider) {
      case 'pixeldrain': directVideoUrl = item.pixeldrain_id ? getPixeldrainUrl(item.pixeldrain_id) : ''; break
      case 'youtube': directVideoUrl = item.video_url || ''; break
      case 'gdrive': directVideoUrl = item.gdrive_id || item.video_url || ''; break
      case 'mega': directVideoUrl = item.video_url || ''; break
      case 'direct': directVideoUrl = item.video_url || ''; break
      default: directVideoUrl = item.video_url || ''
    }
  }
  
  let related = []
  if (item.series_title) {
    related = await query(`
      SELECT id, title, thumbnail_url, episode_number
      FROM yar_content_items WHERE series_title = $1 AND id != $2 AND published = true
      ORDER BY episode_number LIMIT 6
    `, [item.series_title, contentId])
  } else if (item.category) {
    related = await query(`
      SELECT id, title, thumbnail_url
      FROM yar_content_items WHERE category = $1 AND id != $2 AND published = true
      ORDER BY view_count DESC LIMIT 6
    `, [item.category, contentId])
  }
  
  const comments = await query(`
    SELECT c.id, c.comment, c.created_at, u.name as user_name
    FROM yar_video_comments c JOIN yar_users u ON c.user_id = u.id
    WHERE c.content_id = $1 ORDER BY c.created_at DESC
  `, [contentId])
  
  return { content: item, hasAccess, lastPosition, storageProvider, directVideoUrl, related, comments }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userName = headersList.get('x-user-name')
  
  if (!userId) {
    return (
      <div className="page flex items-center justify-center min-h-screen">
        <div className="card max-w-sm p-8 text-center shadow-lg mx-auto">
          <h1 className="font-bold text-2xl mb-4">لطفاً وارد شوید</h1>
          <Link href="/login" className="button button-primary w-full justify-center">ورود به حساب کاربری</Link>
        </div>
      </div>
    )
  }
  
  const data = await getContentData(id, userId)
  
  if (!data) {
    return (
      <div className="page flex flex-col min-h-screen">
        <SiteHeader userName={userName || ''} />
        <main className="shell section flex-1 flex items-center justify-center">
          <div className="card max-w-sm p-8 text-center shadow-lg">
            <h1 className="font-bold text-2xl mb-4 text-ink">محتوا یافت نشد</h1>
            <Link href="/dashboard" className="button button-primary w-full justify-center">بازگشت به داشبورد</Link>
          </div>
        </main>
      </div>
    )
  }
  
  const { content, hasAccess, lastPosition, storageProvider, directVideoUrl, related, comments } = data
  
  return (
    <div className="page flex flex-col min-h-screen">
      <SiteHeader userName={userName || ''} />

      <main className="shell section flex-1 pb-16" style={{ paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        
        {/* Breadcrumb / Back button */}
        <div className="mb-6 slide-up">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-ink-soft hover:text-teal font-bold transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-line-soft shadow-sm">
            <ArrowRight className="w-5 h-5" />
            بازگشت به داشبورد
          </Link>
        </div>

        {!hasAccess ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="card border-2 border-tangerine/30 p-10 text-center max-w-md slide-up relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-tangerine/10 rounded-full blur-3xl"></div>
              
              <div className="w-20 h-20 bg-tangerine/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-tangerine/20 relative z-10">
                <Lock className="w-10 h-10 text-tangerine" />
              </div>
              <h1 className="text-2xl font-bold mb-4 text-ink relative z-10">
                این محتوا ویژه اعضا است
              </h1>
              <p className="text-ink-soft mb-8 leading-relaxed relative z-10">
                برای تماشای این محتوا و دسترسی نامحدود به تمام بخش‌های پلتفرم، باید اشتراک تهیه کنید.
              </p>
              <Link
                href="/subscription"
                className="button button-primary button-lg w-full justify-center shadow-lg relative z-10"
              >
                مشاهده پلن‌های اشتراک
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Media Player / Viewer */}
              <div className="card p-2 shadow-lg slide-up overflow-hidden" style={{ height: content.content_type === 'pdf' ? 'calc(100vh - 140px)' : 'auto', minHeight: content.content_type === 'pdf' ? '600px' : 'auto' }}>
                <div className={`w-full h-full relative rounded-lg overflow-hidden ${content.content_type !== 'pdf' ? 'aspect-video bg-ink' : ''}`}>
                  {content.content_type === 'pdf' ? (
                    <SecurePDFViewer pdfUrl={directVideoUrl} title={content.title} />
                  ) : content.content_type === 'image' ? (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-cream">
                      <img 
                        src={directVideoUrl} 
                        alt={content.title}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                        style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
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

              {/* Title & Description */}
              <div className="card p-6 sm:p-8 slide-up shadow-sm" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {content.category && (
                    <span className="chip bg-sky/10 text-sky-700 border border-sky/20">
                      {content.category}
                    </span>
                  )}
                  {content.content_type === 'pdf' ? (
                    <span className="chip bg-tangerine/10 text-tangerine border border-tangerine/20 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> فایل PDF
                    </span>
                  ) : content.content_type === 'image' ? (
                    <span className="chip bg-sunflower/10 text-yellow-700 border border-sunflower/20 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> تصویر
                    </span>
                  ) : (
                    <span className="chip bg-teal/10 text-teal-700 border border-teal/20 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> ویدیو
                    </span>
                  )}
                  {content.duration_seconds && content.content_type !== 'pdf' && content.content_type !== 'image' && (
                    <span className="text-ink-soft text-sm font-medium mr-auto">
                      {Math.floor(content.duration_seconds / 60)} دقیقه
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-black mb-4 text-ink leading-tight">{content.title}</h1>
                
                {content.series_title && (
                  <div className="inline-block bg-teal/5 border border-teal/10 px-4 py-2 rounded-xl text-teal text-base font-bold mb-6">
                    مجموعه: {content.series_title} {content.episode_number ? `(قسمت ${content.episode_number})` : ''}
                  </div>
                )}
                
                {content.description && (
                  <div className="text-ink-soft leading-relaxed text-lg whitespace-pre-wrap">
                    {content.description}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="card p-6 sm:p-8 slide-up shadow-sm" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-black mb-6 border-b border-line-soft pb-4">نظرات</h2>
                <VideoComments contentId={id} initialComments={comments} />
              </div>

            </div>

            {/* Sidebar Column */}
            <div className="space-y-6 slide-up" style={{ animationDelay: '0.3s' }}>
              {related.length > 0 && (
                <div className="card p-6 shadow-sm sticky top-24">
                  <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-line-soft pb-4">
                    <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                      <Play className="w-4 h-4 text-teal" /> 
                    </div>
                    {content.series_title ? 'سایر قسمت‌ها' : 'محتوای مرتبط'}
                  </h2>
                  
                  <div className="flex flex-col gap-4">
                    {related.map((item: any) => (
                      <Link
                        key={item.id}
                        href={`/watch/${item.id}`}
                        className="group flex gap-4 p-2 rounded-xl hover:bg-line-soft/50 transition-colors border border-transparent hover:border-line-soft"
                      >
                        <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative bg-line-soft">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-ink-soft/50" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-teal transition-colors text-ink">
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
        )}
      </main>
      
      <SiteFooter />
    </div>
  )
}
