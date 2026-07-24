import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Crown, LockKeyhole, Play, Sparkles } from 'lucide-react'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'

async function getCurriculumContent(userId: string) {
  const [hasSubscription, content] = await Promise.all([
    hasActiveSubscription(userId),
    query<any>(`SELECT * FROM yar_content_items WHERE content_type IN ('lesson', 'worksheet', 'reading') AND published = true ORDER BY grade_level, category, title`),
  ])
  const byGrade: Record<string, any[]> = {}
  for (const item of content) (byGrade[item.grade_level || 'other'] ||= []).push(item)
  return { byGrade, hasSubscription }
}

const grades = [
  { id: 'class-1', name: 'کلاس اول', number: '۱' },
  { id: 'class-2', name: 'کلاس دوم', number: '۲' },
  { id: 'class-3', name: 'کلاس سوم', number: '۳' },
]

export default async function CurriculumPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) redirect('/login')
  const { byGrade, hasSubscription } = await getCurriculumContent(user.id)

  return <div className="page"><SiteHeader userName={user.name} isAdmin={user.role === 'admin'} /><main>
    <section className="section"><div className="shell"><span className="section-kicker"><BookOpen /> کلاس درس</span><h1 className="display text-balance">هر روز، یک کشف تازه</h1><p className="lead page-lead">درس‌ها، کاربرگ‌ها و روان‌خوانی برای کلاس‌های اول تا سوم.</p></div></section>
    {!hasSubscription && <div className="shell"><aside className="card subscription-banner"><div><Crown /><h2>همه درس‌ها را باز کن</h2><p>با اشتراک، به تمام محتوای آموزشی دسترسی پیدا می‌کنی.</p></div><Link href="/subscription" className="button button-primary">دیدن اشتراک</Link></aside></div>}
    <div className="shell curriculum-sections">{grades.map((grade) => <section key={grade.id} className="grade-section reveal-section"><div className="grade-heading"><span>{grade.number}</span><div><p className="muted">محتوای آموزشی</p><h2 className="section-title">{grade.name}</h2></div></div>{byGrade[grade.id]?.length ? <div className="lesson-grid">{byGrade[grade.id].map((item) => { const locked = item.tier_requirement !== 'free' && !hasSubscription; return <article key={item.id} className="card card-hover lesson-card"><div className="lesson-media">{item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <BookOpen aria-hidden="true" />}{locked && <div className="poster-lock"><LockKeyhole /><span>نیاز به اشتراک</span></div>}<span className={`chip ${item.tier_requirement === 'free' ? 'chip-free' : 'chip-lock'}`}>{item.tier_requirement === 'free' ? 'رایگان' : 'ویژه'}</span></div><div className="lesson-body"><div className="lesson-tags">{item.category && <span className="chip">{item.category}</span>}{item.content_type === 'reading' && <span className="chip chip-teal">روان‌خوانی</span>}</div><h3>{item.title}</h3>{item.description && <p className="muted">{item.description}</p>}<Link href={locked ? '/subscription' : `/watch/${item.id}`} className={`button ${locked ? 'button-ghost' : 'button-primary'}`}>{locked ? <LockKeyhole /> : <Play />}{locked ? 'تهیه اشتراک' : 'شروع درس'}</Link></div></article>})}</div> : <div className="card empty-state"><Sparkles /><h3>به‌زودی</h3><p className="muted">محتوای این پایه در راه است.</p></div>}</section>)}</div>
  </main><SiteFooter /></div>
}
