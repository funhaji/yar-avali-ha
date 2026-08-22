import Link from 'next/link'
import { ArrowRight, PlayCircle, GraduationCap, Users } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'

export const metadata = {
  title: 'تربیت معلم و معلم خصوصی'
}

export default async function TeacherTrainingPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const settingsData = await getSettings([
    'site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone',
    'tt_video_url', 'tt_video_url_2'
  ])
  const s = settingsData as Record<string, string | null>
  
  return (
    <div className="page bg-cream text-ink flex flex-col min-h-screen">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />
      
      <main className="shell flex-1 py-12">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-soft hover:text-teal font-bold mb-8 transition-colors">
            <ArrowRight className="w-5 h-5" /> بازگشت به صفحه اصلی
          </Link>
          
          <div className="text-center mb-16 slide-up">
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-ink">آموزش و تدریس خصوصی</h1>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
              با استفاده از بهترین متدهای آموزشی و کادری مجرب، آماده ارائه خدمات آموزشی متمایز هستیم.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* تربیت معلم */}
            <div className="card p-8 flex flex-col items-center text-center slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 bg-teal/10 text-teal rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-4">دوره تربیت معلم</h2>
              <p className="text-ink-soft leading-relaxed mb-8">
                در دوره‌های تربیت معلم یار اولی‌ها، شما با جدیدترین شیوه‌های تدریس و روانشناسی کودک آشنا می‌شوید. 
                این دوره مناسب علاقه‌مندان به تدریس مقطع ابتدایی می‌باشد.
              </p>
              
              {s?.tt_video_url && (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-line-soft mb-8">
                  <iframe src={s.tt_video_url} className="w-full h-full border-none" allowFullScreen></iframe>
                </div>
              )}

              <div className="bg-teal text-white w-full p-6 rounded-2xl shadow-sm mt-auto">
                <h3 className="text-xl font-bold mb-2">ثبت نام به زودی!</h3>
                <p className="mb-4 text-white/90">ظرفیت دوره محدود است. برای رزرو و پیش‌ثبت‌نام پیام دهید.</p>
                <div className="bg-white/20 p-3 rounded-xl font-mono text-lg font-bold tracking-wider" dir="ltr">
                  @yar_avali_ha
                </div>
              </div>
            </div>

            {/* معلم خصوصی */}
            <div className="card p-8 flex flex-col items-center text-center slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-tangerine/10 text-tangerine rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-4">معلم خصوصی</h2>
              <p className="text-ink-soft leading-relaxed mb-8">
                درخواست معلم خصوصی برای دانش‌آموزان عزیز. با اساتید مجرب یار اولی‌ها، 
                یادگیری شیرین‌تر و عمیق‌تری را تجربه کنید. رفع اشکال و تقویت پایه‌ای دروس.
              </p>
              
              {s?.tt_video_url_2 && (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-line-soft mb-8">
                  <iframe src={s.tt_video_url_2} className="w-full h-full border-none" allowFullScreen></iframe>
                </div>
              )}

              <div className="bg-tangerine text-white w-full p-6 rounded-2xl shadow-sm mt-auto">
                <h3 className="text-xl font-bold mb-2">درخواست معلم</h3>
                <p className="mb-4 text-white/90">برای هماهنگی و درخواست معلم خصوصی با آیدی زیر در ارتباط باشید.</p>
                <div className="bg-white/20 p-3 rounded-xl font-mono text-lg font-bold tracking-wider" dir="ltr">
                  @yar_avali_ha
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter 
        footerText={s?.footer_text || undefined}
        contactEmail={s?.contact_email || undefined}
        contactPhone={s?.contact_phone || undefined}
        siteName={s?.site_name || undefined}
      />
    </div>
  )
}
