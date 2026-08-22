import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import { query } from '@/lib/db'
import { ProductCard } from '@/components/shop/ProductCard'

import { getCachedSettings, getCachedStoreItems } from '@/lib/cache'

export default async function BooksPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const settingsData = await getCachedSettings(['site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone'])
  const s = settingsData as Record<string, string | null>

  const books = await getCachedStoreItems('کتاب')
  
  return (
    <div className="page bg-cream text-ink">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />
      
      <main className="shell py-12 min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-soft hover:text-tangerine font-bold mb-8 transition-colors">
            <ArrowRight className="w-5 h-5" /> بازگشت به صفحه اصلی
          </Link>
          
          <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-tangerine/10 text-tangerine rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">معرفی کتاب‌ها</h1>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto">
              بهترین کتاب‌های کمک آموزشی، داستانی و مهارتی برای کودکان دبستانی
            </p>
          </div>

          {user?.role === 'admin' && (
            <div className="flex justify-center mb-8">
              <Link href="/admin/store/new?category=کتاب" className="button button-primary">
                + افزودن کتاب جدید
              </Link>
            </div>
          )}

          {books.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {books.map((book: any) => (
                <ProductCard key={book.id} product={book} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <BookOpen className="w-12 h-12 text-ink-soft mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">هنوز کتابی اضافه نشده است</h3>
              <p className="text-ink-soft">به زودی کتاب‌های مفیدی در این بخش قرار می‌گیرد.</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter 
        footerText={s?.footer_text || undefined}
        contactEmail={s?.contact_email || undefined}
        contactPhone={s?.contact_phone || undefined}
      />
    </div>
  )
}
