import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'

export default async function TeacherTrainingPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const settingsData = await getSettings([
    'site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone',
    'tt_title', 'tt_subtitle', 'tt_content', 'tt_image', 'tt_video_url', 'tt_button_text', 'tt_button_link'
  ])
  const s = settingsData as Record<string, string | null>
  
  const title = s?.tt_title || 'دوره جامع تربیت معلم و معلم خصوصی'
  const subtitle = s?.tt_subtitle || 'تدریس برای دانش‌آموزان دبستانی نیازمند مهارت‌ها، صبر و تکنیک‌های خاصی است. در این دوره، ما تمام تجربیات خود را برای تبدیل شدن به یک معلم حرفه‌ای و محبوب در اختیار شما قرار می‌دهیم.'
  const content = s?.tt_content || 'این صفحه در حال آماده‌سازی است. به زودی اطلاعات کامل دوره، سرفصل‌ها، هزینه ثبت‌نام و نمونه تدریس‌ها در این بخش قرار خواهد گرفت.'
  const image = s?.tt_image || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=2000&auto=format&fit=crop'
  const videoUrl = s?.tt_video_url
  const buttonText = s?.tt_button_text || 'ثبت‌نام به زودی فعال می‌شود'
  const buttonLink = s?.tt_button_link || '#'
  
  return (
    <div className="page bg-cream text-ink">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />
      
      <main className="shell py-12 min-h-[70vh]">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-soft hover:text-teal font-bold mb-8 transition-colors">
            <ArrowRight className="w-5 h-5" /> بازگشت به صفحه اصلی
          </Link>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-line-soft slide-up">
            <div className="aspect-video bg-ink w-full relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              {videoUrl ? (
                videoUrl.includes('youtube') || videoUrl.includes('aparat') || videoUrl.includes('pixeldrain') ? (
                  <iframe src={videoUrl} className="absolute inset-0 w-full h-full z-20" allowFullScreen></iframe>
                ) : (
                  <video src={videoUrl} controls className="absolute inset-0 w-full h-full z-20 object-cover" />
                )
              ) : (
                <>
                  <img 
                    src={image} 
                    alt={title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="z-20 text-center text-paper">
                    <button className="w-20 h-20 bg-teal text-white rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform shadow-[0_0_30px_rgba(20,184,166,0.5)]">
                      <PlayCircle className="w-10 h-10" />
                    </button>
                    <div className="font-bold text-xl">دوره آموزشی</div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-8 md:p-12">
              <div className="inline-block bg-teal/10 text-teal px-4 py-1.5 rounded-full font-bold text-sm mb-6 border border-teal/20">
                ویژه معلمان و علاقه‌مندان به تدریس
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                {title}
              </h1>
              
              <div className="prose prose-lg text-ink-soft max-w-none">
                <p className="lead text-xl leading-relaxed mb-6 whitespace-pre-wrap">
                  {subtitle}
                </p>
                <div 
                  className="mb-4 whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
                />
              </div>
              
              <div className="mt-12 flex flex-wrap gap-4">
                {buttonLink !== '#' && buttonLink !== '' ? (
                  <Link href={buttonLink} className="button button-primary button-lg">
                    {buttonText}
                  </Link>
                ) : (
                  <button className="button button-primary button-lg" disabled>
                    {buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter 
        footerText={s?.footer_text || undefined}
        contactEmail={s?.contact_email || undefined}
        contactPhone={s?.contact_phone || undefined}
      />
    </div>
  )
}
