import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { SiteHeader } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'

async function getNewsPosts() {
  const posts = await query(`
    SELECT 
      id, 
      title, 
      slug, 
      excerpt, 
      thumbnail_url, 
      created_at,
      view_count
    FROM yar_news_posts
    WHERE published = true
    ORDER BY created_at DESC
  `)
  return posts
}

export const metadata = {
  title: 'اخبار',
  description: 'آخرین اخبار و رویدادهای پلتفرم'
}

export default async function NewsPage() {
  const headersList = await headers()
  const token = headersList.get('cookie')?.split('session_token=')[1]?.split(';')[0]
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const [posts, settings] = await Promise.all([
    getNewsPosts(),
    getSettings(['site_logo_url', 'site_name']),
  ])
  
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">اخبار و رویدادها</h1>
          <p className="text-lg text-gray-600 mb-12">
            آخرین اخبار و به‌روزرسانی‌های پلتفرم
          </p>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-bold mb-2">خبری موجود نیست</h3>
              <p className="text-gray-600">به زودی اخبار جدید منتشر خواهد شد</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
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
