import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BookOpen, Clapperboard, Crown, Play, Download, ExternalLink, ShoppingBag, HeartHandshake } from 'lucide-react'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { AccountControls } from '@/components/AccountControls'
import { HomepageSlider } from '@/components/HomepageSlider'
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
  
  // Get active slides - with error handling for when table doesn't exist
  let slides: any[] = []
  try {
    slides = await query<any>(
      `SELECT * FROM yar_homepage_slides 
       WHERE is_active = true 
       ORDER BY display_order ASC`
    )
  } catch (error) {
    console.error('Slides table not found or error fetching slides:', error)
    // Table doesn't exist yet, return empty array
  }
  // Get purchased digital items
  const purchasedDigital = await query<any>(
    `SELECT DISTINCT s.id, s.title, s.thumbnail_url, s.is_downloadable, s.file_url, s.content_type, s.storage_provider 
     FROM yar_order_items oi
     JOIN yar_orders o ON oi.order_id = o.id
     JOIN yar_store_items s ON oi.store_item_id = s.id
     WHERE o.user_id = $1 AND s.is_digital = true
     ORDER BY s.id DESC`,
    [userId]
  )
  
  // Get purchased physical items
  const purchasedPhysical = await query<any>(
    `SELECT DISTINCT s.id, s.title, s.thumbnail_url, o.status, o.created_at
     FROM yar_order_items oi
     JOIN yar_orders o ON oi.order_id = o.id
     JOIN yar_store_items s ON oi.store_item_id = s.id
     WHERE o.user_id = $1 AND s.is_digital = false
     ORDER BY o.created_at DESC`,
    [userId]
  )
  
  return { hasSubscription, continuing, watched, slides, purchasedDigital, purchasedPhysical }
}

function firstName(name: string) {
  return name.split(' ')[0]
}

export default async function DashboardPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) redirect('/login')

  const [{ hasSubscription, continuing, watched, slides, purchasedDigital, purchasedPhysical }, settings] = await Promise.all([
    getData(user.id),
    getSettings(['site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone']),
  ])
  const primary = continuing[0]

  return (
    <div className="page">
      <SiteHeader 
        userName={user.name} 
        isAdmin={user.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />

      <main className="shell section" style={{ paddingTop: 'clamp(1.6rem, 4vw, 2.6rem)' }}>
        {/* Quiet greeting row — not a headline moment, just orientation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
            سلام {firstName(user.name)} 👋
          </p>
          {!hasSubscription && (
            <Link href="/subscription" className="chip" style={{ background: 'var(--ink)', color: 'var(--paper)', fontSize: '.82rem', padding: '.4rem .85rem' }}>
              <Crown style={{ width: 14, height: 14 }} /> اشتراک نداری — فعال کن
            </Link>
          )}
        </div>

        {/* Homepage Slider - replaces continue watching hero */}
        {slides && slides.length > 0 ? (
          <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            <HomepageSlider slides={slides} />
          </section>
        ) : primary ? (
          /* Fallback: show continue watching if no slides */
          <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            <Link
              href={`/watch/${primary.content_id}`}
              className="card card-hover"
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
                <h1 className="section-title text-balance" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.2rem)', maxWidth: '26ch' }}>{primary.title}</h1>
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
              {/* progress bar */}
              {primary.duration_seconds ? (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(255,255,255,.2)', zIndex: 1 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round((primary.progress_seconds / primary.duration_seconds) * 100))}%`, background: 'var(--teal)' }} />
                </div>
              ) : null}
            </Link>
          </section>
        ) : (
          /* Empty state: no history yet — this is the actual first-run moment, treat it as one */
          <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            <div className="card" style={{ padding: 'clamp(2rem, 5vw, 3rem)', textAlign: 'center', border: '1px dashed var(--line-soft)' }}>
              <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>هنوز چیزی شروع نکردی</p>
              <p className="muted" style={{ marginTop: '.4rem' }}>یک درس یا یک انیمه رو امتحان کن — همینجا برات نگه می‌داریم.</p>
              <div className="button-row" style={{ justifyContent: 'center', marginTop: '1.4rem' }}>
                <Link href="/curriculum" className="button button-primary">شروع یک درس</Link>
                <Link href="/entertainment" className="button button-ghost">دیدن کتابخانه</Link>
              </div>
            </div>
          </section>
        )}

        {/* Continue watching queue - smaller cards below slider */}
        {continuing.length > 0 && (
          <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            <div className="rail-head" style={{ marginBottom: '.9rem' }}>
              <span style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink-soft)' }}>ادامه تماشا</span>
            </div>
            <div className="rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {continuing.map((x) => {
                const pct = x.duration_seconds ? Math.min(100, Math.round((x.progress_seconds / x.duration_seconds) * 100)) : 0
                return (
                  <Link href={`/watch/${x.content_id}`} key={x.id} className="card card-hover rail-card">
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
                    <div className="rail-body" style={{ padding: '.6rem .7rem .75rem' }}>
                      <div className="rail-title" style={{ fontSize: '.85rem' }}>{x.title}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Purchased Digital Items - New Section */}
        <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }} className="slide-up">
          <div className="rail-head" style={{ marginBottom: '.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag className="w-5 h-5 text-teal" />
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>کتابخانه دیجیتال شما</span>
          </div>
          {purchasedDigital && purchasedDigital.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {purchasedDigital.map((item: any) => (
                <div key={item.id} className="card p-4 flex flex-col hover-lift border border-line-soft">
                  <div className="aspect-square bg-cream rounded-lg overflow-hidden mb-4 relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-soft opacity-30">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-sm mb-4 line-clamp-2 leading-snug flex-1">{item.title}</h4>
                  
                  {item.content_type === 'video' || item.content_type === 'pdf' || item.content_type === 'image' ? (
                    <Link href={`/shop/${item.id}/view`} className="button button-primary w-full justify-center text-sm">
                      <Play className="w-4 h-4" /> مشاهده
                    </Link>
                  ) : item.file_url ? (
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="button button-primary w-full justify-center text-sm">
                      {item.is_downloadable ? <><Download className="w-4 h-4" /> دانلود</> : <><ExternalLink className="w-4 h-4" /> دریافت فایل</>}
                    </a>
                  ) : (
                    <button disabled className="button w-full justify-center text-sm bg-line-soft text-ink-soft cursor-not-allowed">
                      فایل آماده نیست
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center border-dashed">
              <p className="font-bold text-ink-soft">هنوز محصول دیجیتالی خریداری نکردید.</p>
              <Link href="/shop" className="button button-ghost mt-4">مشاهده فروشگاه</Link>
            </div>
          )}
        </section>

        {/* Purchased Physical Items - New Section */}
        <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }} className="slide-up">
          <div className="rail-head" style={{ marginBottom: '.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag className="w-5 h-5 text-teal" />
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>سفارشات فیزیکی شما</span>
          </div>
          {purchasedPhysical && purchasedPhysical.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {purchasedPhysical.map((item: any) => (
                <Link href={`/shop/${item.id}`} key={item.id} className="card p-4 flex flex-col hover-lift border border-line-soft">
                  <div className="aspect-square bg-cream rounded-lg overflow-hidden mb-4 relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-soft opacity-30">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-sm mb-2 line-clamp-2 leading-snug flex-1">{item.title}</h4>
                  <div className="text-xs text-ink-soft mb-4">
                    ثبت شده در: {new Date(item.created_at).toLocaleDateString('fa-IR')}
                  </div>
                  <div className={`button w-full justify-center text-sm ${item.status === 'completed' || item.status === 'shipped' ? 'button-primary' : 'bg-cream text-teal'}`}>
                    وضعیت: {
                      item.status === 'completed' ? 'تکمیل شده' :
                      item.status === 'shipped' ? 'ارسال شده' :
                      item.status === 'processing' ? 'در حال پردازش' :
                      item.status === 'cancelled' ? 'لغو شده' : 'در انتظار'
                    }
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center border-dashed">
              <p className="font-bold text-ink-soft">شما هنوز سفارش فیزیکی ثبت نکردید.</p>
              <Link href="/shop" className="button button-ghost mt-4">مشاهده فروشگاه</Link>
            </div>
          )}
        </section>

        {/* Three doors - curriculum, entertainment, worksheets */}
        <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
          <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>

            <Link href="/worksheets" className="card card-hover" style={{ padding: '1.5rem', border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <div className="tile-ico" style={{ background: '#fff4e6', color: '#e65100', marginBottom: 0 }}>📄</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>کاربرگ‌ها</div>
                  <div className="muted" style={{ fontSize: '.85rem' }}>فایل‌های PDF تمرینی</div>
                </div>
              </div>
              <ArrowLeft style={{ width: 18, opacity: .4 }} />
            </Link>
            <Link href="/entertainment" className="card card-hover" style={{ padding: '1.5rem', border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <div className="tile-ico" style={{ background: '#fde3ef', color: '#c2185b', marginBottom: 0 }}><Clapperboard /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>انیمه و فیلم</div>
                  <div className="muted" style={{ fontSize: '.85rem' }}>کتابخانه سرگرمی</div>
                </div>
              </div>
              <ArrowLeft style={{ width: 18, opacity: .4 }} />
            </Link>
            <Link href="/teachers" className="card card-hover" style={{ padding: '1.5rem', border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <div className="tile-ico" style={{ background: '#e0f0ff', color: '#2563eb', marginBottom: 0 }}><HeartHandshake /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>معلم‌های یاراولیها</div>
                  <div className="muted" style={{ fontSize: '.85rem' }}>آشنایی با تیم آموزشی ما</div>
                </div>
              </div>
              <ArrowLeft style={{ width: 18, opacity: .4 }} />
            </Link>
          </div>
        </section>

        {/* Recently watched — secondary, denser, quieter than continue-watching */}
        {watched.length > 0 && (
          <section style={{ marginBottom: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            <div className="rail-head" style={{ marginBottom: '.9rem' }}>
              <span style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink-soft)' }}>دیده‌های اخیر</span>
            </div>
            <div className="rail" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {watched.map((x) => (
                <Link href={`/watch/${x.content_id}`} key={x.id} className="card card-hover rail-card">
                  <div className="rail-poster" style={{ aspectRatio: '16/9' }}>
                    {x.thumbnail_url ? (
                      <img src={x.thumbnail_url || "/placeholder.svg"} alt={x.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--ink-soft)' }}>
                        {x.content_type === 'lesson' ? <BookOpen /> : <Clapperboard />}
                      </div>
                    )}
                  </div>
                  <div className="rail-body" style={{ padding: '.6rem .7rem .75rem' }}>
                    <div className="rail-title" style={{ fontSize: '.82rem' }}>{x.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="card" style={{ border: '1px solid var(--line-soft)' }}>
          <AccountControls />
        </div>
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
