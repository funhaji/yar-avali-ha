import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { SiteHeader } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'
import VideoPlayer from '@/components/VideoPlayer'

async function getBlogPost(slug: string) {
  const posts = await query(`
    SELECT 
      p.id, 
      p.title, 
      p.slug, 
      p.content, 
      p.thumbnail_url, 
      p.images,
      p.video_url,
      p.video_provider,
      p.created_at,
      p.view_count,
      u.name as author_name
    FROM yar_blog_posts p
    LEFT JOIN yar_users u ON p.author_id = u.id
    WHERE p.slug = $1 AND p.published = true
  `, [slug])
  
  if (posts.length === 0) {
    return null
  }
  
  // Increment view count
  await query(`
    UPDATE yar_blog_posts 
    SET view_count = view_count + 1 
    WHERE slug = $1
  `, [slug])
  
  return posts[0]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'مقاله یافت نشد'
    }
  }
  
  return {
    title: post.title,
    description: post.content.slice(0, 160)
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const headersList = await headers()
  const token = headersList.get('cookie')?.split('session_token=')[1]?.split(';')[0]
  const user = token ? await validateSession(token).catch(() => null) : null
  
  const [post, settings] = await Promise.all([
    getBlogPost(slug),
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
            href="/blog" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            ← بازگشت به وبلاگ
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
            className="prose prose-lg max-w-none text-ink text-lg leading-relaxed mb-12"
            style={{ direction: 'rtl' }}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
          />

          {post.video_url && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">ویدیو</h2>
              <div className="aspect-video bg-ink rounded-xl overflow-hidden shadow-lg border border-line-soft">
                {post.video_provider === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${post.video_url}`}
                    title={post.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : post.video_provider === 'pixeldrain' ? (
                  <iframe
                    src={`https://pixeldrain.com/api/video/${post.video_url}`}
                    title={post.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : post.video_provider === 'gdrive' || post.video_provider === 'aparat' ? (
                  <VideoPlayer 
                    src={post.video_url}
                    provider={post.video_provider}
                    title={post.title}
                    poster={post.thumbnail_url || undefined}
                  />
                ) : (
                  <video 
                    src={post.video_url} 
                    className="w-full h-full"
                    controls 
                    controlsList="nodownload"
                    preload="metadata"
                  />
                )}
              </div>
            </div>
          )}

          {post.images && post.images.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">گالری تصاویر</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {post.images.map((img: string, i: number) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-line-soft hover-lift shadow-sm">
                    <img src={img} alt={`گالری ${i + 1}`} className="w-full h-full object-cover transition-transform hover:scale-105" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}
