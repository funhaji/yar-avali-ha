const fs = require('fs');

const code = \import { redirect } from 'next/navigation'
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
  const books = allItems.filter((i: any) => i.category === '????')

  return (
    <div className="page fade-in">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <div className="flex flex-col gap-6 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="section-kicker"><BookOpen /> ?????? ???????</span>
              <h1 className="display" style={{ fontSize: '2.5rem' }}>???????? ???????</h1>
              <p className="lead" style={{ marginTop: '0.5rem' }}>????? ???????? ?????? ? ???????? ??? ?? ?? ????? ?????? ????.</p>
            </div>
            <Link href="/admin/store/new?category=????" className="button button-primary">
              <Plus /> ?????? ???? ????
            </Link>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-cream border-b border-line-soft text-ink-soft">
                  <tr>
                    <th className="p-4 font-bold text-sm">?????</th>
                    <th className="p-4 font-bold text-sm">????? ????</th>
                    <th className="p-4 font-bold text-sm">???</th>
                    <th className="p-4 font-bold text-sm">????</th>
                    <th className="p-4 font-bold text-sm text-center">??????</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-ink-soft">??? ????? ???? ???.</td>
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
                            <span className="badge" style={{background: '#f3e8ff', color: '#7e22ce', borderColor: '#e9d5ff'}}>??????? (PDF/????)</span>
                          ) : (
                            <span className="badge" style={{background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0'}}>??????</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-teal">{book.is_free ? '??????' : (book.price_cents / 10).toLocaleString() + ' ?????'}</td>
                        <td className="p-4 text-center">
                          <Link href={\/admin/store/\\} className="button button-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            ??????
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
\

fs.writeFileSync('app/admin/books/page.tsx', code);
