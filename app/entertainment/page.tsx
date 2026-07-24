import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clapperboard, Crown, Film, LockKeyhole, Play, Sparkles, Tv } from 'lucide-react'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'

async function getContent(userId: string) {
  const [hasSubscription, series, movies] = await Promise.all([
    hasActiveSubscription(userId),
    query<any>(`SELECT DISTINCT series_title, MIN(thumbnail_url) as thumbnail_url, MIN(genre) as genre, MIN(age_tag) as age_tag, COUNT(*) as episode_count FROM yar_content_items WHERE content_type = 'anime' AND series_title IS NOT NULL AND published = true GROUP BY series_title ORDER BY series_title`),
    query<any>(`SELECT * FROM yar_content_items WHERE content_type = 'movie' AND published = true ORDER BY created_at DESC`),
  ])
  return { hasSubscription, series, movies }
}

export default async function EntertainmentPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) redirect('/login')
  const { hasSubscription, series, movies } = await getContent(user.id)
  return <div className="page"><SiteHeader userName={user.name} isAdmin={user.role === 'admin'} dark /><main>
    <section className="section entertainment-hero"><div className="shell"><span className="section-kicker"><Clapperboard /> وقت تفریح</span><h1 className="display text-balance">قصه‌هایی برای خندیدن و خیال‌پردازی</h1><p className="lead page-lead">فیلم‌ها و مجموعه‌های کودکانه، انتخاب‌شده برای یک تماشای امن و شاد.</p></div></section>
    <div className="entertainment-content">{!hasSubscription && <div className="shell"><aside className="card subscription-banner"><div><Crown /><h2>کتابخانه کامل را باز کن</h2><p>بدون محدودیت به همه فیلم‌ها و مجموعه‌ها دسترسی داشته باش.</p></div><Link href="/subscription" className="button button-primary">فعال‌سازی اشتراک</Link></aside></div>}
    <div className="shell">{series.length > 0 && <section className="media-section"><div className="content-heading"><Tv /><h2 className="section-title">مجموعه‌ها</h2></div><div className="poster-grid">{series.map((item) => <Link key={item.series_title} href={`/series/${encodeURIComponent(item.series_title)}`} className="card card-hover poster-card"><div className="content-poster">{item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.series_title} /> : <Film />}</div><div className="poster-body"><h3>{item.series_title}</h3><div className="lesson-tags">{item.age_tag && <span className="chip">{item.age_tag}</span>}<span className="chip chip-teal">{item.episode_count} قسمت</span></div>{item.genre && <p className="muted">{item.genre}</p>}</div></Link>)}</div></section>}
    {movies.length > 0 && <section className="media-section"><div className="content-heading"><Film /><h2 className="section-title">فیلم‌ها</h2></div><div className="poster-grid">{movies.map((item) => { const locked = item.tier_requirement !== 'free' && !hasSubscription; return <Link key={item.id} href={locked ? '/subscription' : `/watch/${item.id}`} className="card card-hover poster-card"><div className="content-poster">{item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <Clapperboard />}{locked && <div className="poster-lock"><LockKeyhole /><span>نیاز به اشتراک</span></div>}<span className={`chip poster-chip ${item.tier_requirement === 'free' ? 'chip-free' : 'chip-lock'}`}>{item.tier_requirement === 'free' ? 'رایگان' : 'ویژه'}</span></div><div className="poster-body"><h3>{item.title}</h3>{item.genre && <p className="muted">{item.genre}</p>}<span className="watch-link">{locked ? <LockKeyhole /> : <Play />}{locked ? 'باز کردن' : 'تماشا'}</span></div></Link>})}</div></section>}
    {series.length === 0 && movies.length === 0 && <div className="card empty-state"><Sparkles /><h2>به‌زودی</h2><p className="muted">کتابخانه سرگرمی در حال آماده‌شدن است.</p></div>}</div></div>
  </main><SiteFooter /></div>
}
