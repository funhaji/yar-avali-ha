import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { getStoreItems } from '@/lib/store'
import { requireAdmin } from '@/lib/teachers'

export default async function AdminBooksPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  // Fetch only books
  const allItems = await getStoreItems()
  const books = allItems.filter((i: any) => i.category === 'کتاب')

  return (
    <div className="page fade-in">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <div className="flex flex-col gap-6 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="section-kicker"><BookOpen /> مدیریت کتاب‌ها</span>
              <h1 className="display" style={{ fontSize: '2.5rem' }}>کتاب‌های فروشگاه</h1>
              <p className="lead" style={{ marginTop: '0.5rem' }}>تمامی کتاب‌های فیزیکی و دیجیتالی خود را از اینجا مدیریت کنید.</p>
            </div>
            <Link href="/admin/store/new?category=کتاب" className="button button-primary">
              <Plus /> افزودن کتاب جدید
            </Link>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-cream border-b border-line-soft text-ink-soft">
                  <tr>
                    <th className="p-4 font-bold text-sm">تصویر</th>
                    <th className="p-4 font-bold text-sm">عنوان کتاب</th>
                    <th className="p-4 font-bold text-sm">نوع</th>
                    <th className="p-4 font-bold text-sm">قیمت</th>
                    <th className="p-4 font-bold text-sm text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-ink-soft">هیچ کتابی یافت نشد.</td>
                    </tr>
                  ) : (
                    books.map((book: any) => (
                      <tr key={book.id} className="hover:bg-cream/50 transition-colors">
                        <td className="p-4">
                          <img src={book.thumbnail_url || 'https://placehold.co/100'} alt={book.title} className="w-16 h-16 object-cover rounded-lg border border-line-soft" />
                        </td>
                        <td className="p-4 font-bold">{book.title}</td>
                        <td className="p-4">
                          {book.is_digital ? (
                            <span className="badge" style={{background: '#f3e8ff', color: '#7e22ce', borderColor: '#e9d5ff'}}>دیجیتال (PDF/لینک)</span>
                          ) : (
                            <span className="badge" style={{background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0'}}>فیزیکی</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-teal">{book.is_free ? 'رایگان' : (book.price_cents / 10).toLocaleString() + ' تومان'}</td>
                        <td className="p-4 text-center">
                          <Link href={`/admin/store/${book.id}`} className="button button-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            ویرایش
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
