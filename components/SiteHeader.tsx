'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Clapperboard, LayoutDashboard, LogOut } from 'lucide-react'

export function SiteHeader({ userName, isAdmin = false, dark = false }: { userName?: string; isAdmin?: boolean; dark?: boolean }) {
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/')
    router.refresh()
  }

  return (
    <header className={dark ? 'site-header site-header-dark' : 'site-header'}>
      <nav className="site-nav" aria-label="ناوبری اصلی">
        <Link href="/" className="brand"><span className="brand-mark">۱</span><span>یارِ اولی‌ها</span></Link>
        <div className="nav-links">
          <Link href="/curriculum"><BookOpen /> آموزش</Link>
          <Link href="/entertainment"><Clapperboard /> سرگرمی</Link>
          <Link href="/#teachers">معلم‌های ما</Link>
          <Link href="/subscription">اشتراک</Link>
        </div>
        <div className="nav-actions">
          {userName ? <>
            <Link href={isAdmin ? '/admin' : '/dashboard'} className="button button-ghost"><LayoutDashboard /> {isAdmin ? 'مدیریت' : 'داشبورد'}</Link>
            <button className="icon-button" onClick={logout} aria-label="خروج"><LogOut /></button>
          </> : <>
            <Link href="/login" className="button button-ghost">ورود</Link>
            <Link href="/register" className="button button-primary">شروع کن <ArrowLeft /></Link>
          </>}
        </div>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return <footer className="site-footer"><div><Link href="/" className="brand"><span className="brand-mark">۱</span><span>یارِ اولی‌ها</span></Link><p>یادگیری‌ای که بچه‌ها دلشان می‌خواهد ادامه‌اش بدهند.</p></div><div className="footer-links"><Link href="/curriculum">آموزش</Link><Link href="/entertainment">سرگرمی</Link><Link href="/subscription">اشتراک</Link><Link href="/#teachers">معلم‌ها</Link></div><small>تمام حقوق برای یار اولی‌ها محفوظ است.</small></footer>
}
