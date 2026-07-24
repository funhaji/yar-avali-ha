'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clipboard, Info, Link2, Plus } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function NewSubscriptionLinkPage() {
  const [formData, setFormData] = useState({ expiresAt: '', maxRedemptions: '1' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [success, setSuccess] = useState<{ code: string; url: string } | null>(null)

  async function copy(value: string, field: string) {
    await navigator.clipboard.writeText(value)
    setCopied(field)
    window.setTimeout(() => setCopied(''), 1800)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/admin/subscription-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt: new Date(formData.expiresAt).toISOString(), maxRedemptions: Number.parseInt(formData.maxRedemptions, 10) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'خطا در ساخت لینک')
      setSuccess({ code: data.code, url: `${window.location.origin}/subscription?code=${data.code}` })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در برقراری ارتباط')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="site-header">
        <nav className="site-nav" aria-label="ناوبری مدیریت">
          <Link href="/admin" className="brand"><span className="brand-mark">۱</span><span>پنل مدیریت</span></Link>
          <div className="nav-actions"><ThemeToggle /><Link href="/admin" className="button button-ghost"><ArrowRight aria-hidden="true" /> بازگشت</Link></div>
        </nav>
      </header>
      <main className="shell section narrow-shell">
        {success ? (
          <section className="card account-panel result-card">
            <CheckCircle2 className="result-icon" aria-hidden="true" />
            <span className="section-kicker">آماده ارسال</span>
            <h1 className="section-title text-balance">لینک اشتراک ساخته شد</h1>
            <p className="muted">کد یا لینک مستقیم را برای کاربر بفرستید. کاربر برای فعال‌سازی باید وارد حسابش شود.</p>
            <div className="copy-grid">
              <label>کد اشتراک<div className="copy-field"><input className="field ltr" value={success.code} readOnly /><button className="button button-secondary" onClick={() => copy(success.code, 'code')}><Clipboard aria-hidden="true" /> {copied === 'code' ? 'کپی شد' : 'کپی'}</button></div></label>
              <label>لینک مستقیم<div className="copy-field"><input className="field ltr" value={success.url} readOnly /><button className="button button-secondary" onClick={() => copy(success.url, 'url')}><Clipboard aria-hidden="true" /> {copied === 'url' ? 'کپی شد' : 'کپی'}</button></div></label>
            </div>
            <div className="button-row"><button className="button button-primary" onClick={() => setSuccess(null)}><Plus aria-hidden="true" /> ساخت کد دیگر</button><Link href="/admin" className="button button-ghost">بازگشت به پنل</Link></div>
          </section>
        ) : (
          <section className="card account-panel">
            <span className="section-kicker"><Link2 aria-hidden="true" /> اشتراک تازه</span>
            <h1 className="section-title text-balance">ساخت کد اشتراک جدید</h1>
            <p className="muted form-intro">یک کد محدود بسازید که با فعال‌شدن، شش ماه دسترسی کامل می‌دهد.</p>
            {error && <div className="alert-error" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} className="form-stack">
              <label>تاریخ انقضا<input type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))} required dir="ltr" /><small className="muted">بعد از این زمان، کد دیگر قابل استفاده نیست.</small></label>
              <label>تعداد استفاده مجاز<input type="number" min="1" value={formData.maxRedemptions} onChange={(e) => setFormData((prev) => ({ ...prev, maxRedemptions: e.target.value }))} required /><small className="muted">حداکثر تعداد کاربرانی که می‌توانند کد را فعال کنند.</small></label>
              <div className="form-note"><Info aria-hidden="true" /><p>هر کاربر با این کد، شش ماه اشتراک فعال دریافت می‌کند.</p></div>
              <div className="button-row"><button type="submit" className="button button-primary" disabled={loading}>{loading ? 'در حال ساخت...' : 'ساخت لینک'}</button><Link href="/admin" className="button button-ghost">انصراف</Link></div>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
