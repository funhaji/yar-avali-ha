import { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { getPixeldrainUrl } from '@/lib/video'
import VideoPlayer from '@/components/VideoPlayer'
import SecurePDFViewer from '@/components/SecurePDFViewer'
import { VideoComments } from '@/components/VideoComments'
import { ArrowRight, Lock, Play, FileText, Image as ImageIcon } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'

async function getContentData(contentId: string, userId?: string) {
  const content = await query(`SELECT * FROM yar_content_items WHERE id = $1 AND published = true`, [contentId])
  if (content.length === 0) return null
  const item = content[0]
  
  let hasAccess = item.tier_requirement === 'free' || item.content_type === 'pdf' || item.content_type === 'image'
  if (!hasAccess && userId) {
    hasAccess = await hasActiveSubscription(userId)
  }
  
  let lastPosition = 0
  if (userId) {
    const progress = await query(`SELECT progress_seconds FROM yar_viewing_history WHERE user_id = $1 AND content_id = $2`, [userId, contentId])
    lastPosition = progress.length > 0 ? progress[0].progress_seconds : 0
  }
  
  let directVideoUrl = ''
  const storageProvider = item.storage_provider || 'pixeldrain'
  
  // Security: Only compute direct video URL if user has valid access!
  if (hasAccess) {
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
  }
  
  let related = []
  if (item.series_title) {
    related = await query(`
      SELECT id, title, thumbnail_url, episode_number, tier_requirement
      FROM yar_content_items WHERE series_title = $1 AND id != $2 AND published = true
      ORDER BY episode_number LIMIT 6
    `, [item.series_title, contentId])
  } else if (item.category) {
    related = await query(`
      SELECT id, title, thumbnail_url, tier_requirement
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
  let userId = headersList.get('x-user-id') || ''
  let userName = headersList.get('x-user-name') || ''
  
  if (!userId) {
    const token = headersList.get('cookie')?.split('session_token=')[1]?.split(';')[0]
    if (token) {
      const user = await validateSession(token).catch(() => null)
      if (user) {
        userId = user.id
        userName = user.name
      }
    }
  }
  
  const [data, settings] = await Promise.all([
    getContentData(id, userId || undefined),
    getSettings(['site_logo_url', 'site_name']),
  ])
  
  if (!data) {
    return (
      <div className="page flex flex-col min-h-screen">
        <SiteHeader userName={userName || ''} siteLogo={settings.site_logo_url || undefined} siteName={settings.site_name || undefined} />
        <main className="shell section flex-1 flex items-center justify-center">
          <div className="card max-w-sm p-8 text-center shadow-lg">
            <h1 className="font-bold text-2xl mb-4 text-ink">محتوا یافت نشد</h1>
            <Link href="/entertainment" className="button button-primary w-full justify-center">بازگشت به سرگرمی</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }
  
  const { content, hasAccess, lastPosition, storageProvider, directVideoUrl, related, comments } = data
  
  return (
    <div className="page flex flex-col min-h-screen">
      <SiteHeader userName={userName || ''} siteLogo={settings.site_logo_url || undefined} siteName={settings.site_name || undefined} />

      <main className="shell section flex-1 pb-16" style={{ paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        
        {/* Breadcrumb / Back button */}
        <div className="mb-6 slide-up flex items-center justify-between flex-wrap gap-3">
          <Link href="/entertainment" className="inline-flex items-center gap-2 text-ink-soft hover:text-teal font-bold transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-line-soft shadow-sm">
            <ArrowRight className="w-5 h-5" />
            بازگشت به بخش سرگرمی و ویدیوها
          </Link>

          {!hasAccess && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-800 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              محتوای ویژه — نیازمند اشتراک
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Media Player / Locked Viewer */}
            <div className="card p-2 shadow-lg slide-up overflow-hidden" style={{ height: content.content_type === 'pdf' && hasAccess ? 'calc(100vh - 140px)' : 'auto', minHeight: content.content_type === 'pdf' && hasAccess ? '600px' : 'auto' }}>
              <div className={`w-full h-full relative rounded-lg overflow-hidden ${content.content_type !== 'pdf' || !hasAccess ? 'aspect-video bg-black' : ''}`}>
                {hasAccess ? (
                  content.content_type === 'pdf' ? (
                    <SecurePDFViewer pdfUrl={directVideoUrl} title={content.title} />
                  ) : content.content_type === 'image' ? (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-cream">
                      <img 
                        src={directVideoUrl} 
                        alt={content.title} 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                        style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
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
                  )
                ) : (
                  /* Locked state: SHOW THUMBNAIL CLEARLY with Lock Overlay */
                  <div className="w-full h-full relative aspect-video flex items-center justify-center overflow-hidden bg-gray-950">
                    {content.thumbnail_url ? (
                      <img 
                        src={content.thumbnail_url} 
                        alt={content.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-75 transition-all"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-gray-900 to-teal-950" />
                    )}
                    
                    {/* Subtle dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50" />
                    
                    {/* Locked Card Dialog */}
                    <div className="relative z-10 max-w-md mx-4 p-6 sm:p-8 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-center text-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black mb-2 text-white drop-shadow">
                        این محتوا ویژه اعضای دارای اشتراک است
                      </h2>
                      <p className="text-white/80 text-sm sm:text-base mb-6 leading-relaxed">
                        برای باز شدن و تماشای این ویدیو، نیاز به اشتراک فعال دارید.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                          href="/subscription"
                          className="button button-primary font-bold px-6 py-3 justify-center shadow-lg"
                        >
                          خرید یا تمدید اشتراک
                        </Link>
                        {!userId && (
                          <Link
                            href="/login"
                            className="button button-ghost bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 justify-center border border-white/20"
                          >
                            ورود به حساب کاربری
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
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
                {content.genre && (
                  <span className="chip bg-teal/10 text-teal-700 border border-teal/20">
                    {content.genre}
                  </span>
                )}
                {content.age_tag && (
                  <span className="chip bg-pink/10 text-pink-700 border border-pink/20">
                    {content.age_tag}
                  </span>
                )}
                {!hasAccess && (
                  <span className="chip bg-amber-500/15 text-amber-700 border border-amber-500/30 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> ویژه اشتراکی
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
                        {item.tier_requirement && item.tier_requirement !== 'free' && (
                          <div className="absolute top-1 right-1 bg-amber-500/90 text-white p-1 rounded-md text-[10px] leading-none shadow">
                            <Lock className="w-2.5 h-2.5" />
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
      </main>
      
      <SiteFooter />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { query } = require('@/lib/db');
  const result = await query('SELECT * FROM yar_content_items WHERE id = $1', [id]);
  const item = result[0];
  if (!item) return {};
  const url = 'https://www.yaravaliha.ir/watch/' + id;
  return {
    title: item.title,
    description: item.description?.substring(0, 160) || item.title,
    openGraph: {
      title: item.title,
      description: item.description?.substring(0, 160) || item.title,
      url,
      images: item.thumbnail_url ? [item.thumbnail_url] : [],
      type: 'video.other',
    },
  }
}
