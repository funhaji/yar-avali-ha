import Link from 'next/link'
import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'

export const revalidate = 60

export default async function GalleryPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const images = await query(`SELECT * FROM yar_gallery ORDER BY created_at DESC`)
  
  return (
    <div className="page flex flex-col min-h-screen">
      <SiteHeader userName={user?.name} isAdmin={user?.role === 'admin'} />
      
      <main className="shell section flex-1 py-12">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-soft hover:text-teal font-bold mb-8 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-line-soft shadow-sm">
            <ArrowRight className="w-5 h-5" /> بازگشت به صفحه اصلی
          </Link>
          
          <div className="mb-12 text-center slide-up">
            <div className="w-20 h-20 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-ink">گالری تصاویر</h1>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto">
              لحظات شیرین یادگیری و فعالیت‌های دانش‌آموزان و اولیای عزیز در خانواده بزرگ یار اولی‌ها
            </p>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img: any, i: number) => (
                <div key={img.id} className="card relative group overflow-hidden aspect-square slide-up shadow-sm p-1" style={{ animationDelay: `${(i % 10) * 0.05}s` }}>
                  <img 
                    src={img.image_url} 
                    alt={img.title || 'گالری یار اولی ها'} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {img.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 rounded-lg">
                      <p className="text-paper font-bold text-sm md:text-base leading-tight">
                        {img.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-ink-soft border-dashed border-2 flex flex-col items-center">
              <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-bold">هنوز تصویری در گالری ثبت نشده است.</p>
            </div>
          )}
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
