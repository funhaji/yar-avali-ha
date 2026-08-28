import { getStoreItems, getCategories } from '@/lib/store'
import { ProductCard } from '@/components/shop/ProductCard'
import { ShopGrid } from '@/components/shop/ShopGrid'
import { ShopSortSelect } from '@/components/shop/ShopSortSelect'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { ShoppingBag, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getCachedStoreItems, getCachedSettings } from '@/lib/cache'

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const category = params.category || 'all'
  const subcategory = params.subcategory || ''
  const search = params.search || ''
  const sort = params.sort || 'newest'
  
  const allItems = await getCachedStoreItems()
  
  // Filter out products that are free, have no price, or are just for introducing
  let items = allItems.filter(i => !i.is_free && i.price_cents !== 0 && i.price_cents !== null)
  
  if (category !== 'all') {
    items = items.filter(i => i.category === category)
  }
  if (subcategory) {
    items = items.filter(i => i.subcategory === subcategory)
  }
  if (search) {
    items = items.filter(i => (i.title && i.title.includes(search)) || (i.description && i.description.includes(search)))
  }
  if (sort === 'price_asc') {
    items = items.sort((a, b) => (a.discount_price_cents || a.price_cents) - (b.discount_price_cents || b.price_cents))
  } else if (sort === 'price_desc') {
    items = items.sort((a, b) => (b.discount_price_cents || b.price_cents) - (a.discount_price_cents || a.price_cents))
  }
  
  type CatNode = { name: string, count: number, subs: Map<string, number> }
  const catTree = new Map<string, CatNode>()
  allItems.forEach(i => {
    if (!i.is_free && i.price_cents !== 0 && i.price_cents !== null) {
      if (i.category) {
        if (!catTree.has(i.category)) {
          catTree.set(i.category, { name: i.category, count: 0, subs: new Map() })
        }
        const node = catTree.get(i.category)!
        node.count++
        if (i.subcategory) {
          node.subs.set(i.subcategory, (node.subs.get(i.subcategory) || 0) + 1)
        }
      }
    }
  })
  
  const categories = Array.from(catTree.values()).sort((a, b) => b.count - a.count)

  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  const settings = await getCachedSettings(['site_name', 'site_logo_url'])

  return (
    <div className="page bg-cream">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteName={settings.site_name || undefined}
        siteLogo={settings.site_logo_url || undefined}
      />
      
      <main className="shell py-8 md:py-12 flex-1">
        <div className="flex flex-col md:flex-row gap-8 slide-up">
          
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal" /> دسته‌بندی‌ها
              </h2>
              <div className="flex flex-col gap-2">
                <Link 
                  href={`/shop?search=${search}`}
                  className={`px-3 py-2 rounded-lg transition-colors ${category === 'all' ? 'bg-teal text-paper font-bold' : 'hover:bg-cream text-ink-soft'}`}
                >
                  همه محصولات
                </Link>
                {categories.map(cat => (
                  <div key={cat.name} className="flex flex-col">
                    <Link 
                      href={`/shop?category=${cat.name}&search=${search}`}
                      className={`px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${category === cat.name && !subcategory ? 'bg-teal text-paper font-bold' : 'hover:bg-cream text-ink-soft'}`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{cat.count}</span>
                    </Link>
                    {category === cat.name && cat.subs.size > 0 && (
                      <div className="flex flex-col ml-2 mr-4 pr-3 border-r-2 border-line-soft mt-1 mb-1 gap-1">
                        {Array.from(cat.subs.entries()).map(([subName, subCount]) => (
                          <Link 
                            key={subName}
                            href={`/shop?category=${cat.name}&subcategory=${subName}&search=${search}`}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex justify-between items-center ${subcategory === subName ? 'bg-teal/10 text-teal font-bold' : 'hover:bg-cream text-ink-soft'}`}
                          >
                            <span>{subName}</span>
                            <span className="text-xs opacity-70 bg-black/5 px-2 py-0.5 rounded-full">{subCount}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            
            <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h1 className="display" style={{ fontSize: '2rem' }}>فروشگاه</h1>
                <p className="text-ink-soft mt-1">محصولات آموزشی و سرگرمی</p>
              </div>
              
              <form className="flex w-full md:w-auto gap-2" action="/shop" method="GET">
                <input type="hidden" name="category" value={category} />
                {subcategory && <input type="hidden" name="subcategory" value={subcategory} />}
                
                <div className="relative flex-1 max-w-sm">
                  <input 
                    type="text" 
                    name="search" 
                    defaultValue={search}
                    placeholder="بگرد بین محصولات..." 
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-line-soft bg-cream focus:bg-paper focus:outline-none focus:border-teal transition-all"
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                
                <ShopSortSelect defaultValue={sort} />
              </form>
            </div>

            <ShopGrid items={items} category={category} search={search} />
            
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
