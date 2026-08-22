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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          comment: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment('')
      } else {
        alert('خطا در ارسال نظر')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('خطا در ارسال نظر')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-teal" />
        نظرات ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={3}
          className="w-full px-4 py-4 bg-black/20 text-paper border border-white/10 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent resize-none transition-all placeholder:text-paper/40"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="mt-3 button button-primary button-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
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
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-paper/40 border border-dashed border-white/10 rounded-xl">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
          </div>
        ) : (
          comments.map((comment, i) => (
            <div key={comment.id} className={`bg-white/5 border border-white/5 rounded-xl p-5 slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal text-paper rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {comment.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{comment.user_name}</p>
                    <p className="text-xs text-paper/50 mt-0.5">
                      {new Date(comment.created_at).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-paper/80 whitespace-pre-wrap leading-relaxed pr-12">
                {comment.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

