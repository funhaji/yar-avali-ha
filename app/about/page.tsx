import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'
import { getVisibleTeachers } from '@/lib/teachers'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { HeartHandshake, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const token = (await cookies()).get('session_token')?.value
  const [user, settingsData] = await Promise.all([
    token ? validateSession(token).catch(() => null) : Promise.resolve(null),
    
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
