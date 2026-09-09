'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { ClientSiteBrand } from '@/components/ClientSiteName'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  function set(key: string, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }
  
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (form.password !== form.confirmPassword) {
      return setError('رمز عبور و تکرار آن یکسان نیستند')
    }
    
    setLoading(true)
    
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...form })
      })
      const d = await r.json()
      
      if (!r.ok) {
        setError(d.error || 'خطا در ثبت‌نام')
        setLoading(false)
        return
      }
      
      router.push(redirectUrl || '/dashboard')
      router.refresh()
    } catch {
      setError('خطا در برقراری ارتباط')
      setLoading(false)
    }
  }
  
  return (
    <main className="auth-wrap">
      <div className="blob" style={{ width: 390, height: 390, background: 'var(--berry)', top: -170, left: -80, opacity: .8 }} />
      <div className="blob" style={{ width: 280, height: 280, background: 'var(--sunflower)', bottom: -80, right: -80 }} />
      
      <section className="card auth-card">
        <ClientSiteBrand />
        
        <span className="section-kicker"><UserPlus /> شروع یک دوستی</span>
        <h1 className="section-title">حساب کاربری جدید</h1>
        <p className="muted" style={{ marginTop: '.5rem', marginBottom: '1.5rem' }}>
          ثبت‌نام ساده است — فقط اطلاعات پایه‌ای.
        </p>
        
        {error && <div className="alert-error" role="alert">{error}</div>}
        
        <form onSubmit={submit} className="form-stack" style={{ marginTop: '1rem' }}>
          <label>
            نام و نام خانوادگی
            <input 
              type="text" 
              value={form.name} 
              onChange={e => set('name', e.target.value)} 
              placeholder="مثلاً علی رضایی" 
              required 
            />
          </label>
          <label>
            ایمیل
            <input 
              type="email" 
              value={form.email} 
              onChange={e => set('email', e.target.value)} 
              placeholder="you@example.com" 
              required 
              autoComplete="email" 
              dir="ltr"
            />
          </label>
          <label>
            شماره موبایل
            <input 
              type="tel" 
              value={form.phone} 
              onChange={e => set('phone', e.target.value)} 
              placeholder="09123456789" 
              dir="ltr"
            />
          </label>
          <label>
            رمز عبور
            <input 
              type="password" 
              value={form.password} 
              onChange={e => set('password', e.target.value)} 
              placeholder="حداقل ۸ کاراکتر" 
              required 
              minLength={8}
              autoComplete="new-password" 
              dir="ltr"
            />
          </label>
          <label>
            تکرار رمز عبور
            <input 
              type="password" 
              value={form.confirmPassword} 
              onChange={e => set('confirmPassword', e.target.value)} 
              placeholder="تکرار همان رمز" 
              required 
              minLength={8}
              autoComplete="new-password" 
              dir="ltr"
            />
          </label>
          <button className="button button-primary button-lg" disabled={loading}>
            {loading ? 'در حال ثبت‌نام...' : 'ساخت حساب کاربری'}
          </button>
        </form>
        
        <div className="auth-alt">
          <span>قبلاً ثبت‌نام کردی؟</span>
          <a href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}>ورود به حساب</a>
        </div>
      </section>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink-soft">در حال بارگذاری...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
