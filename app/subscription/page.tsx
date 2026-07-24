'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, CheckCircle2, Clapperboard, FileText, KeyRound, ShieldCheck, Sparkles } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'

const benefits = [
  { icon: BookOpen, title: 'همه درس‌ها', text: 'دسترسی کامل به محتوای کلاس‌های اول تا سوم' },
  { icon: Clapperboard, title: 'کتابخانه سرگرمی', text: 'فیلم‌ها و مجموعه‌های کودکانه بدون محدودیت' },
  { icon: FileText, title: 'تمرین و روان‌خوانی', text: 'کاربرگ‌ها و فایل‌های تکمیلی برای یادگیری بیشتر' },
  { icon: ShieldCheck, title: 'محیط امن و آرام', text: 'تجربه‌ای مناسب کودک، بدون تبلیغات مزاحم' },
]

function SubscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check if user is logged in by trying to fetch a protected resource
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false))
  }, [])

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault(); setMessage(null); setLoading(true)
    try {
      const response = await fetch('/api/subscription/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      const data = await response.json()
      if (response.status === 401) {
        // Not logged in - redirect to login with return URL
        router.push(`/login?redirect=/subscription&code=${code}`)
        return
      }
      if (!response.ok) throw new Error(data.error || 'خطا در فعال‌سازی اشتراک')
      setMessage({ type: 'success', text: data.message })
      window.setTimeout(() => router.push('/dashboard'), 1600)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'خطا در برقراری ارتباط' })
    } finally { setLoading(false) }
  }

  return <div className="page"><SiteHeader userName={user?.name} isAdmin={user?.role === 'admin'} /><main>
    <section className="section subscription-hero"><div className="shell subscription-hero-grid"><div><span className="section-kicker"><Sparkles /> شش ماه یادگیری و شادی</span><h1 className="display text-balance">یک کد، دنیایی از محتوا</h1><p className="lead page-lead">با اشتراک یار اولی‌ها، همه درس‌ها و سرگرمی‌های مناسب سن در دسترس کودک شماست.</p></div><div className="card plan-card"><p className="muted">مدت دسترسی</p><strong>۶ ماه</strong><span className="chip chip-teal">دسترسی کامل</span></div></div></section>
    <section className="shell benefits-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="card benefit-card" key={title}><div className="tile-ico"><Icon /></div><div><h2>{title}</h2><p className="muted">{text}</p></div></article>)}</section>
    <section className="section"><div className="shell narrow-shell"><div className="card account-panel redeem-card"><span className="section-kicker"><KeyRound /> فعال‌سازی</span><h2 className="section-title text-balance">کد اشتراکت را وارد کن</h2><p className="muted form-intro">کدی که از پشتیبانی دریافت کرده‌ای اینجا بنویس.</p>{message && <div className={message.type === 'success' ? 'alert-ok' : 'alert-error'} role="status">{message.type === 'success' && <CheckCircle2 />}{message.text}</div>}<form onSubmit={handleRedeem} className="form-stack"><label>کد اشتراک<input className="subscription-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX" required dir="ltr" autoComplete="off" /></label><button type="submit" className="button button-primary button-lg" disabled={loading}>{loading ? 'در حال فعال‌سازی...' : 'فعال‌سازی اشتراک'}</button></form></div></div></section>
  </main><SiteFooter /></div>
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="page"><SiteHeader /><main><div className="shell section"><p>در حال بارگذاری...</p></div></main><SiteFooter /></div>}>
      <SubscriptionContent />
    </Suspense>
  )
}
