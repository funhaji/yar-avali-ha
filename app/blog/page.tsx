import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { SiteHeader } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'

import { getCachedBlogPosts, getCachedSettings } from '@/lib/cache'

export const metadata = {
  title: 'وبلاگ',
  description: 'مقالات و نکات آموزشی برای کودکان و والدین'
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string, search?: string }> }) {
  const headersList = await headers()
  const token = headersList.get('cookie')?.split('session_token=')[1]?.split(';')[0]
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const [posts, settings] = await Promise.all([
    getCachedBlogPosts(),
    getCachedSettings(['site_logo_url', 'site_name']),
  ])
  
  const siteName = settings.site_name || 'یار اولی‌ها'
  
  const sp = await searchParams
  const activeCategory = sp.category || 'all'
  const search = sp.search || ''
  
  // Calculate category counts
  const categoriesMap = new Map<string, number>()
  posts.forEach((p: any) => {
    if (p.category) {
      categoriesMap.set(p.category, (categoriesMap.get(p.category) || 0) + 1)
    }
  })
  const categories = Array.from(categoriesMap.entries())
    .map(([cat, count]) => ({ category: cat, count }))
    .sort((a, b) => b.count - a.count)
    
  let filteredPosts = posts
  
  if (activeCategory !== 'all') {
    filteredPosts = filteredPosts.filter((p: any) => p.category === activeCategory)
  }
  
  if (search) {
    filteredPosts = filteredPosts.filter((p: any) => 
      (p.title && p.title.includes(search)) || 
      (p.excerpt && p.excerpt.includes(search))
    )
  }
  
  return (
    <div className="page bg-cream min-h-screen">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={siteName}
      />
      
      <main className="shell py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-4">وبلاگ و مقالات</h1>
          <p className="text-lg text-ink-soft max-w-2xl mx-auto">
            مقالات و محتواهای آموزشی برای معلمان و والدین
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="card sticky top-24 p-5">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">دسته‌بندی‌ها</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href={`/blog?search=${search}`}
                  className={`px-3 py-2 rounded-lg transition-colors ${activeCategory === 'all' ? 'bg-teal text-paper font-bold' : 'hover:bg-cream text-ink-soft'}`}
                >
                  همه مقالات
                </Link>
                {categories.map(cat => (
                  <Link 
                    key={cat.category}
                    href={`/blog?category=${cat.category}&search=${search}`}
                    className={`px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${activeCategory === cat.category ? 'bg-teal text-paper font-bold' : 'hover:bg-cream text-ink-soft'}`}
                  >
                    <span>{cat.category}</span>
                    <span className="text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Search and Mobile Categories */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-paper p-4 rounded-2xl shadow-sm border border-line-soft">
              
              <div className="flex gap-2 overflow-x-auto w-full md:hidden pb-2 hide-scrollbar">
                <Link href={`/blog?search=${search}`} className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-colors ${activeCategory === 'all' ? 'bg-teal text-paper' : 'bg-cream text-ink-soft hover:bg-line-soft'}`}>
                  همه
                </Link>
                {categories.map(cat => (
                  <Link 
                    key={cat.category} 
                    href={`/blog?category=${cat.category}&search=${search}`}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-colors ${activeCategory === cat.category ? 'bg-teal text-paper' : 'bg-cream text-ink-soft hover:bg-line-soft'}`}>
                    {cat.category}
                  </Link>
                ))}
              </div>
              
              <form className="flex w-full md:w-auto gap-2 ml-auto" action="/blog" method="GET">
                <input type="hidden" name="category" value={activeCategory} />
                <div className="relative flex-1 min-w-[250px]">
                  <input 
                    type="text" 
                    name="search" 
                    defaultValue={search}
                    placeholder="جستجو در مقالات..." 
                    className="w-full px-4 py-2.5 rounded-full border border-line-soft bg-cream focus:bg-paper focus:outline-none focus:border-teal transition-all"
                  />
                </div>
              </form>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-paper rounded-2xl border border-line-soft">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold mb-2">مقاله‌ای یافت نشد</h3>
                <p className="text-ink-soft">با این فیلترها نتیجه‌ای پیدا نشد.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredPosts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="card card-hover flex flex-col sm:flex-row overflow-hidden group"
                  >
                    {post.thumbnail_url && (
                      <div className="sm:w-64 shrink-0 aspect-[4/3] sm:aspect-auto">
                        <img
                          src={post.thumbnail_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h2 className="text-xl font-bold mb-3 group-hover:text-teal transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-ink-soft mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex flex-wrap items-center gap-4 text-sm font-medium text-ink-soft">
                        <span className="bg-cream px-3 py-1 rounded-full text-teal font-bold">{post.category || 'عمومی'}</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span>{post.view_count || 0} بازدید</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
