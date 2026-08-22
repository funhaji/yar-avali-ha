import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { SiteHeader } from '@/components/SiteHeader'
import { NewsManager } from '@/components/admin/NewsManager'
import { Newspaper } from 'lucide-react'

async function getNewsPosts() {
  const posts = await query(`
    SELECT 
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.published,
      p.view_count,
      p.created_at,
      u.name as author_name
    FROM yar_news_posts p
    LEFT JOIN yar_users u ON p.author_id = u.id
    ORDER BY p.created_at DESC
  `)
  return posts
}

export const metadata = {
  title: 'مدیریت اخبار'
}

export default async function AdminNewsPage() {
  const token = (await cookies()).get('session_token')?.value
  if (!token) {
    redirect('/login')
  }

  const user = await validateSession(token)
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  const posts = await getNewsPosts()

  return (
    <div className="page">
      <SiteHeader userName={user.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><Newspaper /> مدیریت اخبار</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>پست‌های خبری</h1>
        <NewsManager initialPosts={posts} />
      </main>
    </div>
  )
}
