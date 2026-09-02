import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { getPixeldrainUrl } from '@/lib/video'
import VideoPlayer from '@/components/VideoPlayer'
import SecurePDFViewerCanvas from '@/components/SecurePDFViewerCanvas'
import { ArrowRight, Lock, Play, FileText, Image as ImageIcon, CheckCircle2, Download } from 'lucide-react'

async function getStoreContentData(contentId: string, userId: string, fileIndex: number = 0) {
  // Get store item details
  const content = await query(`
    SELECT * FROM yar_store_items WHERE id = $1 AND is_digital = true
  `, [contentId])
  
  if (content.length === 0) {
    return null
  }
  
  const item = content[0]
  
  // Check access: Is it free? Or did the user buy it?
  let hasAccess = item.is_free
  if (!hasAccess) {
    const orders = await query(`
      SELECT 1 FROM yar_order_items oi
      JOIN yar_orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND oi.store_item_id = $2
    `, [userId, contentId])
    hasAccess = orders.length > 0
  }
  
  // Get video/PDF URL based on storage provider
  let directVideoUrl = ''
  const storageProvider = item.storage_provider || 'pixeldrain'
  
  // Handle PDF and image content types specifically
  if (item.content_type === 'pdf' || item.content_type === 'image' || item.content_type === 'file') {
    directVideoUrl = (item.file_url || '').split(',')[fileIndex] || (item.file_url || '').split(',')[0] || ''
    
    // Handle Google Drive PDFs/images
    if (item.gdrive_id) {
      if (item.content_type === 'pdf') {
        directVideoUrl = `https://drive.google.com/file/d/${item.gdrive_id}/preview`
      } else {
        directVideoUrl = `https://drive.google.com/uc?export=view&id=${item.gdrive_id}`
      }
    }
  } else {
    // Handle video content
    switch (storageProvider) {
      case 'pixeldrain':
        directVideoUrl = item.pixeldrain_id ? getPixeldrainUrl(item.pixeldrain_id) : (item.file_url || '')
        break
      case 'youtube':
        directVideoUrl = (item.file_url || '').split(',')[fileIndex] || (item.file_url || '').split(',')[0] || ''
        break
      case 'gdrive':
        directVideoUrl = item.gdrive_id || item.file_url || ''
        break
      case 'mega':
        directVideoUrl = (item.file_url || '').split(',')[fileIndex] || (item.file_url || '').split(',')[0] || ''
        break
      case 'direct':
      case 'r2':
        directVideoUrl = (item.file_url || '').split(',')[fileIndex] || (item.file_url || '').split(',')[0] || ''
        break
      default:
        directVideoUrl = (item.file_url || '').split(',')[fileIndex] || (item.file_url || '').split(',')[0] || ''
    }
  }
  
  return {
    content: item,
    hasAccess,
    storageProvider,
    directVideoUrl
  }
}

export default async function ShopViewPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const sp = await searchParams;
  const fileIndex = parseInt(sp.file || '0', 10);

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
  
  const data = await getStoreContentData(id, userId)
  
  if (!data) {
    return (
      <div className="page bg-cream flex items-center justify-center">
        <div className="card max-w-sm p-8 text-center shadow-lg">
          <h1 className="font-bold text-2xl mb-4">محصول یافت نشد</h1>
          <Link href="/dashboard" className="button button-primary">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    )
  }
  
  const { content, hasAccess, storageProvider, directVideoUrl } = data
  
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
        // Access denied - show purchase prompt
        <div className="shell section flex items-center justify-center min-h-[70vh]">
          <div className="card bg-ink-soft/20 border border-white/10 p-10 text-center max-w-md backdrop-blur-sm slide-up">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Lock className="w-10 h-10 text-tangerine" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              شما به این محصول دسترسی ندارید
            </h1>
            <p className="text-paper/70 mb-8 leading-relaxed">
              برای استفاده از این محتوای دیجیتال، ابتدا باید آن را خریداری کنید.
            </p>
            <Link
              href={`/shop/${content.id}`}
              className="button button-primary button-lg w-full justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
            >
              مشاهده در فروشگاه
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content Area */}
          <div className="bg-black/40 border-b border-white/10">
            <div className="shell max-w-[1400px] mx-auto">
              
                {content.file_url && content.file_url.split(',').length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.file_url.split(',').map((u: string, idx: number) => (
                      <a key={idx} href={'?file=' + idx} className={`button ${fileIndex === idx ? 'button-primary' : 'button-ghost bg-white'}`}>
                        فایل {idx + 1}
                      </a>
                    ))}
                  </div>
                )}

<div className="aspect-video w-full relative bg-black rounded-b-2xl overflow-hidden shadow-2xl">
                {content.content_type === 'pdf' ? (
                  <div className="w-full h-full bg-cream text-ink">
                    <SecurePDFViewerCanvas
                      pdfUrl={directVideoUrl}
                      title={content.title}
                    />
                  </div>
                ) : content.content_type === 'image' ? (
                  <div className="w-full h-full p-4 flex items-center justify-center">
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
                ) : content.content_type === 'file' ? (
                   <div className="w-full h-full flex items-center justify-center bg-ink-soft/20">
                     <div className="text-center">
                       <h2 className="font-bold text-2xl mb-4">آماده برای دانلود</h2>
                       <a href={directVideoUrl} target="_blank" rel="noopener noreferrer" className="button button-primary button-lg shadow-lg">
                         <Download className="w-6 h-6" />
                         دریافت مستقیم فایل
                       </a>
                     </div>
                   </div>
                ) : (
                  <VideoPlayer
                    contentId={id}
                    storageProvider={storageProvider}
                    videoUrl={directVideoUrl}
                    startPosition={0}
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
                    ) : content.content_type === 'video' ? (
                      <span className="flex items-center gap-1.5 text-teal bg-teal/10 px-3 py-1 rounded-full text-sm font-bold border border-teal/20">
                        <Play className="w-4 h-4" /> ویدیو
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-teal bg-teal/10 px-3 py-1 rounded-full text-sm font-bold border border-teal/20">
                        <Download className="w-4 h-4" /> فایل دانلودی
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">{content.title}</h1>
                  
                  {content.description && (
                    <p className="text-paper/80 leading-relaxed text-lg bg-white/5 p-6 rounded-2xl border border-white/10">
                      {content.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
