import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft, BookOpen, Clapperboard, Sparkles, Star, Palette, Rocket, HeartHandshake, ShieldCheck } from 'lucide-react'
import { validateSession } from '@/lib/auth'
import { getVisibleTeachers } from '@/lib/teachers'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'

export default async function HomePage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  const teachers = await getVisibleTeachers()

  return (
    <div className="page">
      <SiteHeader userName={user?.name} isAdmin={user?.role === 'admin'} />

      {/* HERO */}
      <section className="hero section">
        <div className="blob" style={{ width: 320, height: 320, background: 'var(--sunflower)', top: -60, left: -80, opacity: .55 }} />
        <div className="blob" style={{ width: 260, height: 260, background: 'var(--teal)', bottom: -90, right: -60, opacity: .4 }} />
        <div className="shell hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <span className="section-kicker"><Sparkles /> مدرسه‌ای که بوی خلاقیت می‌دهد</span>
            <h1 className="display text-balance">یادگیری برای بچه‌ها،
              <br /><span className="hl">مثل بازی</span> جذاب می‌شود</h1>
            <p className="lead" style={{ marginTop: '1.2rem' }}>درس‌های تصویری، تمرین‌های شاد و کتابخانه‌ای پر از انیمیشن و فیلم مناسب سن، همه در یک جای امن برای کلاس اولی‌ها.</p>
            <div className="button-row" style={{ marginTop: '1.8rem' }}>
              <Link href={user ? '/dashboard' : '/register'} className="button button-primary button-lg">{user ? 'رفتن به داشبورد' : 'رایگان شروع کن'} <ArrowLeft /></Link>
              <Link href="/subscription" className="button button-ghost button-lg">اشتراک‌ها</Link>
            </div>
            <div style={{ display: 'flex', gap: '1.4rem', marginTop: '2rem', flexWrap: 'wrap', fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', gap: '.4rem', alignItems: 'center' }}><ShieldCheck style={{ width: 20, color: 'var(--teal)' }} /> محیط امن کودک</span>
              <span style={{ display: 'inline-flex', gap: '.4rem', alignItems: 'center' }}><Star style={{ width: 20, color: 'var(--tangerine)' }} /> مناسب سن</span>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 320 }}>
            <div className="card" style={{ padding: '1.6rem', transform: 'rotate(-3deg)', background: 'var(--tangerine)', color: 'var(--paper)' }}>
              <BookOpen style={{ width: 40, height: 40 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '.6rem' }}>درس‌های تصویری</h3>
              <p style={{ marginTop: '.4rem' }}>ریاضی، فارسی و علوم با انیمیشن.</p>
            </div>
            <div className="card" style={{ padding: '1.4rem', position: 'absolute', bottom: -20, left: -10, width: '70%', transform: 'rotate(4deg)', background: 'var(--teal)', color: 'var(--paper)' }}>
              <Clapperboard style={{ width: 34, height: 34 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '.4rem' }}>کتابخانه سرگرمی</h3>
            </div>
            <div className="sticker" style={{ width: 74, height: 74, top: -18, left: 30, transform: 'rotate(10deg)', background: 'var(--sunflower)' }}>
              <Star style={{ width: 30 }} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ paddingBlock: '2rem' }}>
        <div className="shell">
          <div className="tiles">
            <div className="card card-hover tile">
              <div className="tile-ico" style={{ background: 'var(--sunflower)' }}><BookOpen /></div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>محتوای درسی</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7 }}>ریاضی، فارسی، علوم و روان‌خوانی برای کلاس‌های اول تا سوم.</p>
            </div>
            <div className="card card-hover tile">
              <div className="tile-ico" style={{ background: 'var(--teal)', color: 'var(--paper)' }}><Clapperboard /></div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>انیمه و فیلم</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7 }}>کتابخانه‌ای از سریال‌ها و فیلم‌های کودکانه مناسب سن.</p>
            </div>
            <div className="card card-hover tile">
              <div className="tile-ico" style={{ background: 'var(--berry)', color: 'var(--paper)' }}><Palette /></div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>یادگیری خلاق</h3>
              <p className="muted" style={{ marginTop: '.4rem', lineHeight: 1.7 }}>تمرین‌ها و بازی‌هایی که کنجکاوی بچه‌ها را زنده نگه می‌دارد.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEACHERS */}
      <section className="section" id="teachers">
        <div className="shell">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <span className="section-kicker"><HeartHandshake /> تیم دوست‌داشتنی</span>
              <h2 className="section-title">معلم‌های ما را بشناسید</h2>
            </div>
            <p className="muted" style={{ maxWidth: '38ch', lineHeight: 1.7 }}>هر درس را کسی می‌سازد که عاشق آموزش کودکان است.</p>
          </div>

          {teachers.length > 0 ? (
            <div className="teacher-grid">
              {teachers.map((t) => (
                <article key={t.id} className="card card-hover teacher-card">
                  {t.photo_url ? (
                    <img src={t.photo_url || "/placeholder.svg"} alt={t.name} className="teacher-photo" />
                  ) : (
                    <div className="teacher-photo" style={{ display: 'grid', placeItems: 'center', color: 'var(--ink-soft)' }}><Sparkles style={{ width: 40 }} /></div>
                  )}
                  <div className="teacher-body">
                    <h3 className="teacher-name">{t.name}</h3>
                    {t.specialty && <span className="chip teacher-specialty">{t.specialty}</span>}
                    {t.bio && <p className="muted" style={{ lineHeight: 1.7, fontSize: '.95rem' }}>{t.bio}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2.4rem', textAlign: 'center' }}>
              <Sparkles style={{ width: 40, margin: '0 auto .6rem', color: 'var(--tangerine)' }} />
              <p className="muted">به‌زودی معلم‌های ما را اینجا معرفی می‌کنیم.</p>
            </div>
          )}
        </div>
      </section>

      {/* SUBSCRIPTION CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="card" style={{ padding: 'clamp(2rem, 5vw, 3.5rem)', background: 'var(--ink)', color: 'var(--paper)', display: 'grid', gap: '1.4rem', gridTemplateColumns: '1fr', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="section-kicker" style={{ background: 'var(--sunflower)' }}><Rocket /> اشتراک ۶ ماهه</span>
                <h2 className="section-title text-balance" style={{ maxWidth: '20ch' }}>دسترسی کامل به همه درس‌ها و فیلم‌ها</h2>
              </div>
              <Link href="/subscription" className="button button-secondary button-lg">فعال‌سازی اشتراک <ArrowLeft /></Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
