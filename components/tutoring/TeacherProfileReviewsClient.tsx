'use client'

import { useState } from 'react'
import { Star, MessageSquarePlus, Users, Sparkles, CheckCircle2 } from 'lucide-react'
import { Teacher, TeacherReview } from '@/lib/teachers'
import { TeacherReviewFormModal } from './TeacherReviewFormModal'

interface TeacherProfileReviewsClientProps {
  teacher: Teacher
  initialReviews: TeacherReview[]
}

export function TeacherProfileReviewsClient({
  teacher,
  initialReviews
}: TeacherProfileReviewsClientProps) {
  const [reviews, setReviews] = useState<TeacherReview[]>(initialReviews)
  const [filter, setFilter] = useState<'all' | 'parent' | 'teacher'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const rating = teacher.star_rating ?? 5.0
  const totalReviewsCount = reviews.length > 0 ? reviews.length : (teacher.review_count ?? 0)

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true
    return r.reviewer_role === filter
  })

  const parentCount = reviews.filter(r => r.reviewer_role === 'parent').length
  const teacherCount = reviews.filter(r => r.reviewer_role === 'teacher').length

  const refreshReviews = async () => {
    try {
      const res = await fetch(`/api/teachers/${teacher.id}/reviews`)
      if (res.ok) {
        const data = await res.json()
        if (data.reviews) {
          setReviews(data.reviews)
        }
      }
    } catch {
      // silent catch
    }
  }

  return (
    <div className="card p-6 md:p-8 border-2 border-slate-300 bg-white shadow-sm rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-deep" />
            <span>نظرات و تجربیات واقعی</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(rating)
                      ? 'fill-amber-400 text-amber-500'
                      : 'fill-slate-100 text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-black text-slate-900 text-sm">{rating} از ۵</span>
            <span className="text-slate-500 text-xs font-bold">({totalReviewsCount} نظر ثبت‌شده)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-deep hover:bg-teal text-white font-black text-sm shadow-xs border-2 border-teal-800 transition-all hover:scale-102 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>ثبت نظر و تجربه شما</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 ${
              filter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            همه نظرات ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('parent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 ${
              filter === 'parent'
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-teal-50 text-teal-900 border-teal-200 hover:border-teal-300'
            }`}
          >
            والدین دانش‌آموزان ({parentCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('teacher')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 ${
              filter === 'teacher'
                ? 'bg-purple-800 text-white border-purple-900'
                : 'bg-purple-50 text-purple-900 border-purple-200 hover:border-purple-300'
            }`}
          >
            معلمان و همکاران ({teacherCount})
          </button>
        </div>
      )}

      {/* Reviews Content */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-black text-slate-700 mb-1">
            {reviews.length === 0
              ? 'هنوز نظری برای این استاد نمایش داده نشده است.'
              : 'در این دسته‌بندی هنوز نظری وجود ندارد.'}
          </p>
          <p className="text-xs text-slate-500 font-medium mb-4">
            اگر با این استاد جلسه تدریس یا دوره تربیت معلم داشته‌اید، تجربه خود را با دیگران به اشتراک بگذارید.
          </p>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-black text-teal-deep hover:underline"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>ثبت اولین نظر برای این استاد</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(r => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-200 text-slate-700 flex items-center justify-center font-black text-sm">
                    {r.reviewer_name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{r.reviewer_name}</span>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${
                          r.reviewer_role === 'teacher'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {r.reviewer_role === 'teacher' ? 'معلم / همکار' : 'ولی دانش‌آموز'}
                      </span>
                    </div>
                    {r.subject_or_topic && (
                      <span className="text-xs text-slate-600 font-semibold block mt-0.5">
                        موضوع / درس: {r.subject_or_topic}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="text-xs font-black text-slate-800">{r.rating}</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium mt-2 whitespace-pre-line text-justify">
                {r.comment}
              </p>

              {r.created_at && (
                <div className="mt-3 text-[11px] text-slate-600 font-medium">
                  {new Date(r.created_at).toLocaleDateString('fa-IR')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      <TeacherReviewFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        teacher={teacher}
        onOpenContact={() => {
          window.scrollTo({ top: 300, behavior: 'smooth' })
        }}
        onSuccess={() => {
          setStatusMessage('نظر شما با موفقیت ثبت شد و پس از بررسی و تایید مدیر سایت نمایش داده می‌شود.')
          refreshReviews()
          setTimeout(() => setStatusMessage(null), 8000)
        }}
      />
    </div>
  )
}
