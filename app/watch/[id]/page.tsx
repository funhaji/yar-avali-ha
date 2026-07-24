import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Clock, Crown, Film, LockKeyhole, Play } from 'lucide-react'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { generateVideoToken, getWatermarkText } from '@/lib/video'
import VideoPlayer from '@/components/VideoPlayer'
import { ThemeToggle } from '@/components/ThemeToggle'

async function getContentData(contentId: string, userId: string, userName: string, userPhone?: string) {
  const content = await query<any>('SELECT * FROM yar_content_items WHERE id = $1 AND published = true', [contentId])
  if (!content.length) return null
  const item = content[0]
  const [subscribed, progress] = await Promise.all([
    item.tier_requirement === 'free' ? Promise.resolve(true) : hasActiveSubscription(userId),
    query<any>('SELECT progress_seconds FROM yar_viewing_history WHERE user_id = $1 AND content_id = $2', [userId, contentId]),
  ])
  const related = item.series_title
    ? await query<any>('SELECT id, title, thumbnail_url, episode_number FROM yar_content_items WHERE series_title = $1 AND id != $2 AND published = true ORDER BY episode_number LIMIT 6', [item.series_title, contentId])
    : item.category ? await query<any>('SELECT id, title, thumbnail_url FROM yar_content_items WHERE category = $1 AND id != $2 AND published = true ORDER BY view_count DESC LIMIT 6', [item.category, contentId]) : []
  return { content: item, hasAccess: subscribed, watermark: getWatermarkText(userName, userPhone), lastPosition: progress[0]?.progress_seconds || 0, videoToken: generateVideoToken(contentId, userId), related }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) redirect('/login')
  const data = await getContentData(id, user.id, user.name, user.phone)
  if (!data) return <div className="watch-page"><div className="watch-empty card"><Film /><h1>محتوا پیدا نشد</h1><Link href="/dashboard" className="button button-primary">بازگشت به داشبورد</Link></div></div>
  const { content, hasAccess, watermark, lastPosition, videoToken, related } = data
  return <div className="watch-page"><header className="watch-header"><div className="watch-shell"><Link href="/dashboard" className="button button-ghost"><ArrowRight /> بازگشت</Link><span>{user.name}</span><ThemeToggle /></div></header>
    {!hasAccess ? <main className="watch-shell watch-center"><section className="card watch-lock"><LockKeyhole /><span className="section-kicker"><Crown /> محتوای ویژه</span><h1 className="section-title text-balance">این ویدیو با اشتراک باز می‌شود</h1><p className="muted">برای تماشای این ویدیو و دسترسی به تمام محتوای پلتفرم، اشتراکت را فعال کن.</p><Link href="/subscription" className="button button-primary button-lg">فعال‌سازی اشتراک</Link></section></main> : <main className="watch-shell watch-content"><div className="video-frame"><VideoPlayer contentId={id} videoToken={videoToken} watermark={watermark} startPosition={lastPosition} title={content.title} /></div><section className="watch-info"><div><h1 className="section-title">{content.title}</h1>{content.series_title && <p className="watch-series">{content.series_title} ـ قسمت {content.episode_number}</p>}{content.description && <p className="muted watch-description">{content.description}</p>}</div><div className="lesson-tags">{content.category && <span className="chip">{content.category}</span>}{content.age_tag && <span className="chip chip-teal">{content.age_tag}</span>}{content.duration_seconds && <span className="chip"><Clock /> {Math.floor(content.duration_seconds / 60)} دقیقه</span>}</div></section>{related.length > 0 && <section className="related-section"><h2 className="section-title">{content.series_title ? 'قسمت‌های دیگر' : 'محتوای مرتبط'}</h2><div className="related-grid">{related.map((item) => <Link key={item.id} href={`/watch/${item.id}`} className="card card-hover related-card"><div>{item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <Film />}</div><h3>{item.episode_number && `${item.episode_number}. `}{item.title}</h3><span><Play /> تماشا</span></Link>)}</div></section>}</main>}
  </div>
}
