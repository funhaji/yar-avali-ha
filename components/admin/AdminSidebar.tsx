'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, FileVideo, Settings, Image as ImageIcon, 
  Users, HeartHandshake, Link2, MessageCircle, BookOpen, 
  FileText, Newspaper, ExternalLink, Menu, X, MessageSquare
} from 'lucide-react'
import { useState } from 'react'

const MENU_ITEMS = [
  { href: '/dashboard', label: 'داشبورد کاربری', icon: LayoutDashboard },
  { href: '/admin', label: 'پیشخوان ادمین', icon: LayoutDashboard },
  { href: '/admin/content', label: 'مدیریت محتوا', icon: FileVideo },
  { href: '/admin/settings', label: 'تنظیمات سایت', icon: Settings },
  { href: '/admin/slider', label: 'اسلایدر داشبورد', icon: ImageIcon },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/teachers', label: 'معلم‌ها', icon: HeartHandshake },
  { href: '/admin/subscriptions/new', label: 'کدهای اشتراک', icon: Link2 },
  { href: '/admin/support', label: 'پشتیبانی تیکت', icon: MessageCircle },
  { href: '/admin/comments', label: 'نظرات', icon: MessageSquare },
  { href: '/admin/store', label: 'فروشگاه', icon: BookOpen },
  { href: '/admin/books', label: 'کتاب‌ها', icon: BookOpen },
  { href: '/admin/blog', label: 'وبلاگ', icon: FileText },
  { href: '/admin/news', label: 'اخبار', icon: Newspaper },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-teal text-white p-4 rounded-full shadow-xl"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 right-0 z-50
        w-64 h-screen h-[100dvh]
        bg-paper border-l border-line-soft
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-4 border-b border-line-soft flex items-center justify-between">
          <Link href="/admin" className="font-bold text-xl text-teal-deep">یار اولی‌ها | مدیریت</Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden">
            <X className="w-5 h-5 text-ink-soft" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-teal text-white font-bold' 
                    : 'text-ink-soft hover:bg-cream hover:text-ink'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-line-soft">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-soft hover:bg-cream hover:text-ink transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            <span>مشاهده سایت</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
