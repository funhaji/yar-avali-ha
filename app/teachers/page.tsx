import { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'
import { getVisibleTeachers } from '@/lib/teachers'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { Sparkles, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'



export default async function TeachersPage() {
  const token = (await cookies()).get('session_token')?.value
  const [user, teachers, settingsData] = await Promise.all([
    token ? validateSession(token).catch(() => null) : Promise.resolve(null),
    getVisibleTeachers().catch(() => []),
    getSettings([
      'site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone'
    ])
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

      <main className="shell flex-1 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 slide-up">
            <span className="inline-flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-full font-bold text-sm mb-4">
              <Users className="w-4 h-4" /> تیم آموزشی
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-ink">معلم‌های یاراولیها</h1>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
              با بهترین مدرسین پایه اول کشور آشنا شوید و از تدریس بی‌نظیر آن‌ها بهره‌مند شوید.
            </p>
          </div>

          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
              {teachers.map((t) => (
                <Link href={`/teachers/${t.id}`} key={t.id} className="card card-hover p-6 text-center border border-line-soft block group">
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-full h-full rounded-full object-cover border-4 border-white shadow-md transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-teal/10 text-teal flex items-center justify-center border-4 border-white shadow-md transition-transform group-hover:scale-105">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t.name}</h3>
                  {t.specialty && <div className="text-sm font-bold text-teal mb-3">{t.specialty}</div>}
                  {t.bio && <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">{t.bio}</p>}
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center border-dashed border-2 border-line-soft max-w-xl mx-auto slide-up">
              <Sparkles className="w-12 h-12 text-teal opacity-20 mx-auto mb-4" />
              <p className="text-ink-soft text-lg">به‌زودی معلم‌های ما را اینجا معرفی می‌کنیم.</p>
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


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'معلم‌ها',
    description: 'معرفی بهترین معلم‌های پایه اول تا سوم دبستان همکار با یار اولی‌ها.',
    alternates: { canonical: 'https://yar-avali-ha.vercel.app/teachers' }
  }
}
