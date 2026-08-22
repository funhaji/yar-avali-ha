import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { SiteHeader } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'

async function getNewsPost(slug: string) {
  const posts = await query(`
    SELECT 
      p.id, 
      p.title, 
      p.slug, 
      p.content, 
      p.thumbnail_url, 
      p.created_at,
      p.view_count,
      u.name as author_name
    FROM yar_news_posts p
    LEFT JOIN yar_users u ON p.author_id = u.id
    WHERE p.slug = $1 AND p.published = true
  `, [slug])
  
  if (posts.length === 0) {
    return null
  }
  
  // Increment view count
  await query(`
    UPDATE yar_news_posts 
    SET view_count = view_count + 1 
    WHERE slug = $1
  `, [slug])
  
  return posts[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsPost(slug)
  
  if (!post) {
    return {
      title: 'خبر یافت نشد'
    }
  }
  
  return {
    title: post.title,
    description: post.content.slice(0, 160)
  }
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const headersList = await headers()
  const token = headersList.get('cookie')?.split('session_token=')[1]?.split(';')[0]
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const [post, settings] = await Promise.all([
    getNewsPost(slug),
    getSettings(['site_logo_url', 'site_name']),
  ])
  
  if (!post) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteLogo={settings.site_logo_url || undefined}
        siteName={settings.site_name || undefined}
      />
      
      <main className="container mx-auto px-4 py-16">
        <article className="max-w-3xl mx-auto">
          <Link 
            href="/news" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            ← بازگشت به اخبار
          </Link>
          
          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl mb-8"
            />
          )}
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-600 mb-8 pb-8 border-b">
            {post.author_name && (
              <>
                <span>نویسنده: {post.author_name}</span>
                <span>•</span>
              </>
            )}
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
          
          <div 
            className="prose prose-lg max-w-none"
            style={{ direction: 'rtl' }}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
          />
        </article>
      </main>
    </div>
  )
}
