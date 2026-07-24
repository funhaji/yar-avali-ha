'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, BookOpen, Clapperboard, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const links = [
  { href: '/curriculum', label: 'آموزش', icon: BookOpen },
  { href: '/entertainment', label: 'سرگرمی', icon: Clapperboard },
  { href: '/#teachers', label: 'معلم‌های ما' },
  { href: '/subscription', label: 'اشتراک' },
]

export function SiteHeader({ userName, isAdmin = false, dark = false }: { userName?: string; isAdmin?: boolean; dark?: boolean }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/')
    router.refresh()
  }

  return (
    <header className={dark ? 'site-header site-header-dark' : 'site-header'}>
      <nav className="site-nav" aria-label="ناوبری اصلی">
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-mark">۱</span><span>یارِ اولی‌ها</span></Link>
        <div className="nav-links">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href}>{Icon && <Icon aria-hidden="true" />} {label}</Link>)}
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <div className="desktop-actions">
            {userName ? <>
              <Link href={isAdmin ? '/admin' : '/dashboard'} className="button button-ghost"><LayoutDashboard aria-hidden="true" /> {isAdmin ? 'مدیریت' : 'داشبورد'}</Link>
              <button className="icon-button" onClick={logout} aria-label="خروج"><LogOut aria-hidden="true" /></button>
            </> : <>
              <Link href="/login" className="button button-ghost">ورود</Link>
              <Link href="/register" className="button button-primary">شروع کن <ArrowLeft aria-hidden="true" /></Link>
            </>}
          </div>
          <button className="icon-button menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-inner">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)}>{Icon && <Icon aria-hidden="true" />} {label}</Link>)}
          <div className="mobile-account-actions">
            {userName ? <>
              <Link href={isAdmin ? '/admin' : '/dashboard'} className="button button-secondary" onClick={() => setMenuOpen(false)}><LayoutDashboard aria-hidden="true" /> {isAdmin ? 'مدیریت' : 'داشبورد'}</Link>
              <button className="button button-ghost" onClick={logout}><LogOut aria-hidden="true" /> خروج</button>
            </> : <>
              <Link href="/login" className="button button-ghost" onClick={() => setMenuOpen(false)}>ورود</Link>
              <Link href="/register" className="button button-primary" onClick={() => setMenuOpen(false)}>شروع کن <ArrowLeft aria-hidden="true" /></Link>
            </>}
          </div>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return <footer className="site-footer"><div><Link href="/" className="brand"><span className="brand-mark">۱</span><span>یارِ اولی‌ها</span></Link><p>یادگیری‌ای که بچه‌ها دلشان می‌خواهد ادامه‌اش بدهند.</p></div><div className="footer-links"><Link href="/curriculum">آموزش</Link><Link href="/entertainment">سرگرمی</Link><Link href="/subscription">اشتراک</Link><Link href="/#teachers">معلم‌ها</Link></div><small>تمام حقوق برای یار اولی‌ها محفوظ است.</small></footer>
}
