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
  contentId: string
  initialComments: Comment[]
}

export function VideoComments({ contentId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, comment: newComment }),
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
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ارسال نظر
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-ink-soft border border-dashed border-line-soft rounded-xl bg-cream/50">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
          </div>
        ) : (
          comments.map((comment, i) => (
            <div key={comment.id} className={`bg-paper border border-line-soft rounded-xl p-5 slide-up shadow-sm`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal/10 text-teal rounded-full flex items-center justify-center font-bold text-lg border border-teal/20">
                    {comment.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-ink">{comment.user_name}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {new Date(comment.created_at).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-ink/90 whitespace-pre-wrap leading-relaxed pr-12">
                {comment.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
