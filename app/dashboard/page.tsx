import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  ArrowLeft, BookOpen, Clapperboard, Crown, Play, Download, 
  ExternalLink, ShoppingBag, HeartHandshake, FileText, Sparkles, 
  KeyRound, ShieldCheck, Film 
} from 'lucide-react'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { AccountControls } from '@/components/AccountControls'
import { HomepageSlider } from '@/components/HomepageSlider'
import { UserOrdersSection } from '@/components/dashboard/UserOrdersSection'
import { getUserOrders } from '@/lib/orders'
import { getSettings } from '@/lib/settings'

async function getData(userId: string) {
  const hasSubscription = await hasActiveSubscription(userId)
  const history = await query<any>(
    `SELECT vh.*, c.title, c.thumbnail_url, c.duration_seconds, c.content_type
     FROM yar_viewing_history vh
     JOIN yar_content_items c ON vh.content_id = c.id
     WHERE vh.user_id = $1
     ORDER BY vh.last_watched_at DESC
     LIMIT 8`,
    [userId]
  )
  const continuing = history.filter((x) => !x.completed && x.progress_seconds > 0).slice(0, 5)
  const watched = history.filter((x) => x.completed).slice(0, 6)
  
  // Get active slides - with error handling
  let slides: any[] = []
  try {
    slides = await query<any>(
      `SELECT * FROM yar_homepage_slides 
       WHERE is_active = true 
       ORDER BY display_order ASC`
    )
  } catch (error) {
    console.error('Slides table not found or error fetching slides:', error)
  }
  
  return { hasSubscription, continuing, watched, slides }
}

function firstName(name: string) {
  return name.split(' ')[0]
}

export default async function DashboardPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) redirect('/login')

  const [{ hasSubscription, continuing, watched, slides }, settings, userOrders] = await Promise.all([
    getData(user.id),
    getSettings(['site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone']),
    getUserOrders(user.id),
  ])
  const primary = continuing[0]

  return (
    <div className="page bg-[#f8fafc] min-h-screen flex flex-col">
      <SiteHeader 
        userName={user.name} 
        isAdmin={user.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />

      <main className="shell py-8 md:py-12 flex-1 space-y-10">
        {/* Welcome Profile Hero Card */}
        <section className="card p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-teal/15 via-teal/5 to-amber-500/10 border border-teal/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 slide-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {user.name.slice(0, 1)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-ink">سلام، {user.name} عزیز! 👋</h1>
                {hasSubscription ? (
                  <span className="badge bg-amber-100 text-amber-800 border-amber-300 font-bold text-xs flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-600" /> اشتراک ویژه فعال
                  </span>
                ) : (
                  <span className="badge bg-gray-100 text-gray-700 border-gray-300 text-xs">
                    کاربر عادی
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-ink-soft">
                به پیشخوان آموزشی یار اولی‌ها خوش آمدید. از این بخش به دوره‌ها، فایل‌ها و سفارشات دسترسی دارید.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {!hasSubscription ? (
              <Link 
                href="/subscription" 
                className="button bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 text-sm transition-all hover:shadow-lg"
              >
                <Crown className="w-4 h-4" />
                <span>فعال‌سازی اشتراک ویژه</span>
              </Link>
            ) : (
              <Link 
                href="/entertainment" 
                className="button button-ghost border border-teal/30 bg-white/90 text-teal-deep font-bold py-2.5 px-4 rounded-xl text-sm flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>کتابخانه انیمه و فیلم‌ها</span>
              </Link>
            )}
          </div>
        </section>

        {/* Homepage Slider */}
        {slides && slides.length > 0 ? (
          <section className="slide-up">
            <HomepageSlider slides={slides} />
          </section>
        ) : primary ? (
          /* Fallback: Continue Watching Hero */
          <section className="slide-up">
            <Link
              href={`/watch/${primary.content_id}`}
              className="card card-hover overflow-hidden rounded-3xl"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr)',
                border: 'none',
                position: 'relative',
                aspectRatio: '21/9',
                minHeight: 220,
              }}
            >
              {primary.thumbnail_url ? (
                <img src={primary.thumbnail_url || "/placeholder.svg"} alt={primary.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(20,19,31,.92) 0%, rgba(20,19,31,.35) 55%, rgba(20,19,31,.05) 100%)' }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', padding: 'clamp(1.2rem, 3vw, 2rem)', color: 'var(--paper)' }}>
                <span className="chip" style={{ background: 'rgba(255,255,255,.15)', color: 'var(--paper)', width: 'fit-content', marginBottom: '.7rem', backdropFilter: 'blur(4px)' }}>
                  ادامه تماشا
                </span>
                <h2 className="section-title text-balance" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.2rem)', maxWidth: '26ch' }}>{primary.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span className="button button-primary">
                    <Play style={{ width: 18, height: 18 }} /> ادامه بده
                  </span>
                  {primary.duration_seconds ? (
                    <span style={{ fontSize: '.85rem', opacity: .8, fontWeight: 600 }}>
                      {Math.max(1, Math.round((primary.duration_seconds - primary.progress_seconds) / 60))} دقیقه تا پایان
                    </span>
                  ) : null}
                </div>
              </div>
              {/* Progress Bar */}
              {primary.duration_seconds ? (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(255,255,255,.2)', zIndex: 1 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round((primary.progress_seconds / primary.duration_seconds) * 100))}%`, background: 'var(--teal)' }} />
                </div>
              ) : null}
            </Link>
          </section>
        ) : null}

        {/* Continue Watching Queue */}
        {continuing.length > 0 && (
          <section className="space-y-4 slide-up">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-lg text-ink">ادامه تماشا</h3>
            </div>
            <div className="rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {continuing.map((x) => {
                const pct = x.duration_seconds ? Math.min(100, Math.round((x.progress_seconds / x.duration_seconds) * 100)) : 0
                return (
                  <Link href={`/watch/${x.content_id}`} key={x.id} className="card card-hover rail-card rounded-2xl overflow-hidden border border-line-soft">
                    <div className="rail-poster" style={{ aspectRatio: '16/9' }}>
                      {x.thumbnail_url ? (
                        <img src={x.thumbnail_url || "/placeholder.svg"} alt={x.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--ink-soft)' }}><Play /></div>
                      )}
                      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(0,0,0,.25)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--teal)' }} />
                      </div>
                    </div>
                    <div className="rail-body p-3">
                      <div className="rail-title text-xs font-bold line-clamp-1">{x.title}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* User Orders & Purchases Section */}
        <section className="slide-up">
          <UserOrdersSection initialOrders={userOrders} />
        </section>

        {/* Quick Access Grid (4 Doors) */}
        <section className="space-y-4 slide-up">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal" />
            <h3 className="font-bold text-lg text-ink">دسترسی سریع</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/worksheets" 
              className="card card-hover p-6 rounded-3xl border border-line-soft bg-gradient-to-br from-amber-50/70 to-paper flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-0.5">کاربرگ‌ها</h4>
                  <p className="text-xs text-ink-soft">فایل‌های تمرینی PDF</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-ink-soft group-hover:text-amber-700 group-hover:-translate-x-1 transition-all" />
            </Link>

            <Link 
              href="/entertainment" 
              className="card card-hover p-6 rounded-3xl border border-line-soft bg-gradient-to-br from-rose-50/70 to-paper flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clapperboard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-0.5">انیمه و فیلم</h4>
                  <p className="text-xs text-ink-soft">کتابخانه سرگرمی و فیلم</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-ink-soft group-hover:text-rose-700 group-hover:-translate-x-1 transition-all" />
            </Link>

            <Link 
              href="/shop" 
              className="card card-hover p-6 rounded-3xl border border-line-soft bg-gradient-to-br from-teal/10 to-paper flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal/15 text-teal flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-0.5">فروشگاه کتاب</h4>
                  <p className="text-xs text-ink-soft">کتاب‌ها و لوازم‌التحریر</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-ink-soft group-hover:text-teal group-hover:-translate-x-1 transition-all" />
            </Link>

            <Link 
              href="/teachers" 
              className="card card-hover p-6 rounded-3xl border border-line-soft bg-gradient-to-br from-blue-50/70 to-paper flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-0.5">معلم‌های ما</h4>
                  <p className="text-xs text-ink-soft">آشنایی با اساتید یار اولی‌ها</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-ink-soft group-hover:text-blue-700 group-hover:-translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        {/* Recently Watched */}
        {watched.length > 0 && (
          <section className="space-y-4 slide-up">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-lg text-ink">دیده‌های اخیر</h3>
            </div>
            <div className="rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {watched.map((x) => (
                <Link href={`/watch/${x.content_id}`} key={x.id} className="card card-hover rail-card rounded-2xl overflow-hidden border border-line-soft">
                  <div className="rail-poster" style={{ aspectRatio: '16/9' }}>
                    {x.thumbnail_url ? (
                      <img src={x.thumbnail_url || "/placeholder.svg"} alt={x.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--ink-soft)' }}>
                        {x.content_type === 'lesson' ? <BookOpen /> : <Clapperboard />}
                      </div>
                    )}
                  </div>
                  <div className="rail-body p-2.5">
                    <div className="rail-title text-xs font-bold line-clamp-1">{x.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Account Security */}
        <section className="card p-6 md:p-8 rounded-3xl border border-line-soft bg-paper slide-up">
          <AccountControls />
        </section>
      </main>

      <SiteFooter 
        footerText={settings.footer_text || undefined}
        contactEmail={settings.contact_email || undefined}
        contactPhone={settings.contact_phone || undefined}
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />
    </div>
  )
}
