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

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
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
  
  const categories = Array.from(new Set(posts.map((p: any) => p.category).filter(Boolean))) as string[]
  const filteredPosts = activeCategory === 'all' ? posts : posts.filter((p: any) => p.category === activeCategory)
  
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={siteName}
      />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">وبلاگ {siteName}</h1>
          <p className="text-lg text-gray-600 mb-6">
            مقالات و نکات آموزشی برای معلمان و والدین
          </p>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              <Link href="/blog" className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${activeCategory === 'all' ? 'bg-teal text-white border-teal' : 'bg-white text-ink-soft border-line-soft hover:border-teal'}`}>
                همه
              </Link>
              {categories.map(cat => (
                <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${activeCategory === cat ? 'bg-teal text-white border-teal' : 'bg-white text-ink-soft border-line-soft hover:border-teal'}`}>
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-2">مقاله‌ای موجود نیست</h3>
              <p className="text-gray-600">به زودی مقالات جدید منتشر خواهد شد</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {filteredPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {post.thumbnail_url && (
                      <div className="md:col-span-1">
                        <img
                          src={post.thumbnail_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className={`p-6 ${post.thumbnail_url ? 'md:col-span-2' : 'md:col-span-3'}`}>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {new Date(post.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <span>{post.view_count || 0} بازدید</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
