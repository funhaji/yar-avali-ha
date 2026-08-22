import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { SiteHeader } from '@/components/SiteHeader'
import { BlogManager } from '@/components/admin/BlogManager'
import { FileText } from 'lucide-react'

async function getBlogPosts() {
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
    FROM yar_blog_posts p
    LEFT JOIN yar_users u ON p.author_id = u.id
    ORDER BY p.created_at DESC
  `)
  return posts
}

export const metadata = {
  title: 'مدیریت وبلاگ'
}

export default async function AdminBlogPage() {
  const token = (await cookies()).get('session_token')?.value
  if (!token) {
    redirect('/login')
  }

  const user = await validateSession(token)
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  const posts = await getBlogPosts()

  return (
    <div className="page">
      <SiteHeader userName={user.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><FileText /> مدیریت وبلاگ</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>پست‌های وبلاگ</h1>
        <BlogManager initialPosts={posts} />
      </main>
    </div>
  )
}
