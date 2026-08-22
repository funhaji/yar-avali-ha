import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'
import { getVisibleTeachers } from '@/lib/teachers'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { HeartHandshake, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const token = (await cookies()).get('session_token')?.value
  const [user, teachers, settingsData] = await Promise.all([
    token ? validateSession(token).catch(() => null) : Promise.resolve(null),
    getVisibleTeachers().catch(() => []),
    getSettings([
      'site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone',
      'about_title', 'about_subtitle', 'about_content', 'about_image'
    ])
  ])

  const s = settingsData as Record<string, string | null>

  return (
    <div className="page bg-cream text-ink">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />
      
      <main className="shell py-12 md:py-20 min-h-[70vh]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16 slide-up">
            <h1 className="text-4xl md:text-5xl font-black mb-6">{s?.about_title || 'درباره یار اولی‌ها'}</h1>
            {s?.about_subtitle && (
              <p className="text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
                {s.about_subtitle}
              </p>
            )}
          </div>

          {s?.about_image && (
            <div className="rounded-3xl overflow-hidden mb-16 shadow-lg border border-line-soft slide-up stagger-1">
              <img 
                src={s.about_image} 
                alt="درباره ما" 
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {s?.about_content && (
            <div className="prose prose-lg max-w-none text-ink text-lg leading-relaxed mb-20 slide-up stagger-2" style={{ direction: 'rtl' }} dangerouslySetInnerHTML={{ __html: s.about_content.replace(/\n/g, '<br>') }} />
          )}

          {teachers.length > 0 && (
            <div className="mt-20 slide-up stagger-3">
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-full font-bold text-sm mb-4">
                  <HeartHandshake className="w-4 h-4" /> تیم دوست‌داشتنی ما
                </span>
                <h2 className="text-3xl font-bold">معلم‌های یار اولی‌ها</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((t) => (
                  <div key={t.id} className="card card-hover p-6 text-center border border-line-soft">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-cream shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-teal/10 text-teal flex items-center justify-center">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-1">{t.name}</h3>
                    {t.specialty && <div className="text-sm font-bold text-teal mb-3">{t.specialty}</div>}
                    {t.bio && <p className="text-sm text-ink-soft line-clamp-3 leading-relaxed">{t.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
