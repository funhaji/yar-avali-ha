'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, LogIn, Sparkles } from 'lucide-react'
import { ClientSiteBrand } from '@/components/ClientSiteName'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      })
      const d = await r.json()
      
      if (!r.ok) {
        setError(d.error || 'خطا در ورود')
        setLoading(false)
        return
      }
      
      router.push(redirectUrl || (d.role === 'admin' ? '/admin' : '/dashboard'))
      router.refresh()
    } catch {
      setError('خطا در برقراری ارتباط')
      setLoading(false)
    }
  }
  
  return (
    <main className="auth-wrap">
      <div className="blob" style={{ width: 360, height: 360, background: 'var(--teal)', top: -120, right: -100 }} />
      <div className="blob" style={{ width: 300, height: 300, background: 'var(--sunflower)', bottom: -100, left: -80 }} />
      
      <section className="card auth-card">
        <ClientSiteBrand />
        
        <span className="section-kicker"><LogIn /> خوش برگشتی</span>
        <h1 className="section-title">دوباره شروع کنیم؟</h1>
        <p className="muted" style={{ marginTop: '.5rem', marginBottom: '1.5rem' }}>
          حسابت منتظر توست.
        </p>
        
        {error && <div className="alert-error" role="alert">{error}</div>}
        
        <form onSubmit={submit} className="form-stack" style={{ marginTop: '1rem' }}>
          <label>
            ایمیل
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              required 
              autoComplete="email" 
              dir="ltr"
            />
          </label>
          <label>
            رمز عبور
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              autoComplete="current-password" 
              dir="ltr"
            />
          </label>
          <button className="button button-primary button-lg" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود به حساب'}
          </button>
        </form>
        
        <div className="auth-alt">
          <span>حساب نداری؟</span>
          <a href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}>ثبت‌نام رایگان</a>
        </div>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink-soft">در حال بارگذاری...</div>}>
      <LoginForm />
    </Suspense>
  )
}
