'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Clapperboard, LayoutDashboard, LogOut, Menu, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/lib/store-context'
import { useSettings } from '@/lib/settings-context'

import { icons } from 'lucide-react'
function DynamicIcon({ name, ...props }: { name: string, [key: string]: any }) {
  // @ts-ignore
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}


export function SiteHeader({ userName, isAdmin = false, dark = false, siteLogo: propLogo, siteName: propName }: { userName?: string; isAdmin?: boolean; dark?: boolean; siteLogo?: string; siteName?: string }) {
  const router = useRouter()
  const { siteLogo: ctxLogo, siteName: ctxName, navLinks } = useSettings()
  
  const siteLogo = propLogo || ctxLogo
  const siteName = propName || ctxName
  
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Need to handle hydration mismatch for cart by only rendering after mount
  const [mounted, setMounted] = useState(false)
  const { totalItems, setDrawerOpen } = useCart()

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/')
    router.refresh()
  }

  const headerClass = [
    'site-header',
    dark ? 'site-header-dark' : '',
    scrolled ? 'is-scrolled' : '',
  ].filter(Boolean).join(' ')

  return (
    <header className={headerClass}>
      <nav className="site-nav" aria-label="ناوبری اصلی">
        <Link href="/" className="brand">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName || 'یارِ اولی‌ها'} style={{ maxHeight: '60px', objectFit: 'contain' }} />
          ) : (
            <>
              <span className="brand-mark">۱</span>
              <span>{siteName || 'یارِ اولی‌ها'}</span>
            </>
          )}
        </Link>
        <button 
          className="icon-button mobile-menu-btn" 
          onClick={() => setMobileOpen(!mobileOpen)} 
          aria-label="منو"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((link, idx) => (
              <Link key={idx} href={link.url} onClick={() => setMobileOpen(false)} className={link.url === '/shop' ? 'font-bold text-teal' : ''}>
                {link.icon && <DynamicIcon name={link.icon} className="w-4 h-4 inline-block ml-1" />}
                {link.title}
              </Link>
            ))}
          </div>
        <div className="nav-actions">
          {userName && (
            <button 
              onClick={() => setDrawerOpen(true)}
              className="icon-button relative ml-2" 
              aria-label="سبد خرید"
            >
              <ShoppingBag className="w-5 h-5 text-ink" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-tangerine text-paper rounded-full text-[10px] font-bold flex items-center justify-center scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          )}
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

export function SiteFooter({ footerText, contactEmail, contactPhone, siteLogo: propLogo, siteName: propName }: { footerText?: string; contactEmail?: string; contactPhone?: string; siteLogo?: string; siteName?: string }) {
  const { siteLogo: ctxLogo, siteName: ctxName } = useSettings()
  
  const siteLogo = propLogo || ctxLogo
  const siteName = propName || ctxName

  return (
    <footer className="site-footer">
        <div className="flex flex-col items-center">
          <Link href="/" className="brand" style={{ justifyContent: "center", marginBottom: "1rem" }}>
          {siteLogo ? (
            <img src={siteLogo} alt={siteName || 'یارِ اولی‌ها'} style={{ maxHeight: '60px', objectFit: 'contain' }} />
          ) : (
            <>
              <span className="brand-mark">۱</span>
              <span>{siteName || 'یارِ اولی‌ها'}</span>
            </>
          )}
        </Link>
        <p>{footerText || 'یادگیری‌ای که بچه‌ها دلشان می‌خواهد ادامه‌اش بدهند.'}</p>
        {(contactEmail || contactPhone) && (
          <div style={{ marginTop: '1rem', fontSize: '.9rem', opacity: 0.8 }}>
            {contactEmail && <div>ایمیل: {contactEmail}</div>}
            {contactPhone && <div>تلفن: {contactPhone}</div>}
          </div>
        )}
      </div>
      <div className="footer-links">
        <Link href="/shop">فروشگاه</Link>
        <Link href="/entertainment">سرگرمی</Link>
        <Link href="/worksheets">کاربرگ‌ها</Link>
        <Link href="/books">کتاب‌ها</Link>
        <Link href="/blog">وبلاگ</Link>
        <Link href="/about">درباره ما</Link>
        <Link href="/subscription">اشتراک</Link>
        <Link href="/#teachers">معلم‌ها</Link>
      </div>
      <small>تمام حقوق برای {siteName || 'یار اولی‌ها'} محفوظ است.</small>
    </footer>
  )
}
