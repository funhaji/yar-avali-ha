import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getComments() {
  return query(`
    SELECT c.id, c.comment, c.created_at, u.name as user_name, v.title as content_title
    FROM yar_video_comments c
    JOIN yar_users u ON c.user_id = u.id
    JOIN yar_content_items v ON c.content_id = v.id
    ORDER BY c.created_at DESC
    LIMIT 50
  `)
}

export default async function CommentsAdminPage() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  
  if (!user || user.role !== 'admin') redirect('/')
  
  const comments = await getComments()
  
  async function deleteComment(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    if (!id) return
    const { query } = await import('@/lib/db')
    await query('DELETE FROM yar_video_comments WHERE id = $1', [id])
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/comments')
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">مدیریت نظرات</h1>
          <p className="text-ink-soft">آخرین ۵۰ نظر ثبت شده</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="card p-12 text-center text-ink-soft">
            هیچ نظری یافت نشد.
          </div>
        ) : (
          comments.map((c: any) => (
            <div key={c.id} className="card p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-teal">{c.user_name}</span>
                  <span className="text-xs text-ink-soft">در ویدیو: {c.content_title}</span>
                  <span className="text-xs text-ink-soft">• {new Date(c.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
                <p className="text-ink">{c.comment}</p>
              </div>
              <form action={deleteComment}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
