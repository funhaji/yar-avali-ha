import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, BookOpen, Trash2, Tag, Percent } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { getStoreItems } from '@/lib/store'
import { requireAdmin } from '@/lib/teachers' // Using requireAdmin from teachers or auth

export default async function AdminStorePage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const items = await getStoreItems()

  return (
    <div className="page fade-in">
      <SiteHeader userName={admin.name} isAdmin />
      
      <main className="shell section">
        <div className="flex flex-col gap-6 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="section-kicker"><BookOpen /> فروشگاه</span>
              <h1 className="display" style={{ fontSize: '2.5rem' }}>مدیریت محصولات</h1>
              <p className="lead" style={{ marginTop: '0.5rem' }}>محصولات فیزیکی و دیجیتالت رو اینجا مدیریت کن</p>
            </div>
            
            <Link href="/admin/store/new" className="button button-primary">
              <Plus /> محصول جدید
            </Link>
          </div>

          <div className="card mt-4 overflow-hidden">
            {items.length === 0 ? (
              <div className="p-12 text-center text-ink-soft">
                <BookOpen className="mx-auto w-12 h-12 mb-4 opacity-50" />
                <p>هنوز هیچ محصولی اضافه نکردی.</p>
                <Link href="/admin/store/new" className="button button-primary mt-4 inline-flex">
                  <Plus /> اضافه کردن اولین محصول
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-line-soft bg-cream">
                      <th className="p-4 font-bold text-sm">محصول</th>
                      <th className="p-4 font-bold text-sm">نوع</th>
                      <th className="p-4 font-bold text-sm">قیمت (تومان)</th>
                      <th className="p-4 font-bold text-sm">موجودی</th>
                      <th className="p-4 font-bold text-sm">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-b border-line-soft hover:bg-cream/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-line-soft overflow-hidden shrink-0">
                              {item.thumbnail_url ? (
                                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-ink-soft">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                {item.title}
                                {item.is_free && <span className="badge badge-sunflower">رایگان</span>}
                              </div>
                              <div className="text-sm text-ink-soft mt-1">{item.category || 'بدون دسته'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {item.is_digital ? (
                            <span className="badge bg-teal/10 text-teal-deep">دیجیتال {item.is_downloadable ? '(دانلودی)' : ''}</span>
                          ) : (
                            <span className="badge bg-ink/10 text-ink">فیزیکی</span>
                          )}
                        </td>
                        <td className="p-4">
                          {item.discount_price_cents !== null ? (
                            <div>
                              <div className="font-bold text-teal-deep flex items-center gap-1">
                                {item.discount_price_cents / 10} <Percent className="w-3 h-3" />
                              </div>
                              <div className="text-xs text-ink-soft line-through">{item.price_cents / 10}</div>
                            </div>
                          ) : (
                            <div className="font-bold">{item.price_cents / 10}</div>
                          )}
                        </td>
                        <td className="p-4">
                          {item.is_digital ? (
                            <span className="text-ink-soft text-sm">نامحدود</span>
                          ) : (
                            <span className={item.stock_quantity === 0 ? 'text-berry font-bold' : 'font-medium'}>
                              {item.stock_quantity !== null ? item.stock_quantity : 'نامشخص'}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/store/${item.id}`} className="icon-button" title="ویرایش">
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
