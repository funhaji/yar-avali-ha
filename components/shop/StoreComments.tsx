'use client'

import { useState } from 'react'
import { MessageSquare, Send, Loader2 } from 'lucide-react'

type Comment = {
  id: string
  comment: string
  user_name: string
  created_at: string
}

type Props = {
  storeItemId: string
  initialComments: Comment[]
  user?: any
}

export function StoreComments({ storeItemId, initialComments, user }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/store/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeItemId, comment: newComment }),
      })
      const data = await res.json()
      
      if (res.ok && data.comment) {
        setComments([data.comment, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to post comment', error)
    }
    setSubmitting(false)
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-ink">
        <MessageSquare className="w-6 h-6 text-teal" />
        نظرات ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="نظر خود را بنویسید..."
            rows={3}
            className="w-full px-4 py-4 bg-paper text-ink border border-line-soft rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent resize-none transition-all placeholder:text-ink-soft/60"
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="mt-3 button button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-1" />
                  ثبت نظر
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-cream border border-line-soft rounded-xl text-center">
          <p className="text-ink-soft mb-3">برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.</p>
          <a href="/login" className="button button-primary inline-flex">ورود به سایت</a>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-paper rounded-xl border border-line-soft text-ink-soft">
            هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-paper p-5 rounded-xl border border-line-soft transition-all hover:shadow-sm">
              <div className="flex justify-between items-center mb-3 border-b border-line-soft/50 pb-3">
                <div className="font-bold text-teal-deep text-lg">{comment.user_name}</div>
                <div className="text-sm text-ink-soft opacity-70">
                  {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                </div>
              </div>
              <p className="text-ink leading-relaxed whitespace-pre-line">{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
