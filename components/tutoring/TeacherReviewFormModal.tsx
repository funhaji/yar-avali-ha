'use client'

import { useState, useEffect } from 'react'
import { X, Star, Send, CheckCircle2, AlertCircle, Loader2, Lock, LogIn, PhoneCall } from 'lucide-react'
import Link from 'next/link'
import { Teacher } from '@/lib/teachers'

interface TeacherReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
  onSuccess?: () => void
  onOpenContact?: () => void
}

export function TeacherReviewFormModal({
  isOpen,
  onClose,
  teacher,
  onSuccess,
  onOpenContact
}: TeacherReviewFormModalProps) {
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerRole, setReviewerRole] = useState<'parent' | 'teacher'>('parent')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [subjectOrTopic, setSubjectOrTopic] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [eligibility, setEligibility] = useState<{ canReview: boolean; reason?: string }>({ canReview: false })
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (isOpen && teacher) {
      setCheckingEligibility(true)
      fetch(`/api/teachers/${teacher.id}/reviews`)
        .then(res => res.json())
        .then(d => {
          if (d.user) {
            setCurrentUser(d.user)
            if (!reviewerName) setReviewerName(d.user.name || '')
          } else {
            setCurrentUser(null)
          }
          if (d.eligibility) {
            setEligibility(d.eligibility)
          }
          setCheckingEligibility(false)
        })
        .catch(() => {
          setCheckingEligibility(false)
        })
    }
  }, [isOpen, teacher?.id])

  if (!isOpen || !teacher) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!reviewerName.trim()) {
      setError('لطفاً نام و نام خانوادگی خود را وارد کنید')
      return
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError('متن نظر باید حداقل ۵ کاراکتر باشد')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/teachers/${teacher.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: reviewerName.trim(),
          reviewer_role: reviewerRole,
          rating,
          subject_or_topic: subjectOrTopic.trim() || null,
          comment: comment.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'خطا در ثبت نظر')
        setLoading(false)
        return
      }

      setIsSuccess(true)
      setLoading(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError('خطا در برقراری ارتباط با سرور: ' + err.message)
      setLoading(false)
    }
  }

  function handleReset() {
    setReviewerName('')
    setReviewerRole('parent')
    setRating(5)
    setSubjectOrTopic('')
    setComment('')
    setError('')
    setIsSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b-2 border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black">
              ثبت نظر و امتیاز برای {teacher.name}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              تجربه واقعی خود از تدریس یا دوره‌های این استاد را به اشتراک بگذارید
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkingEligibility ? (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-teal animate-spin" />
              <span className="text-xs font-bold text-slate-600">در حال بررسی دسترسی ثبت نظر...</span>
            </div>
          ) : !currentUser ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center">
                <LogIn className="w-7 h-7 text-amber-700" />
              </div>
              <h4 className="text-base font-black text-slate-900">نیاز به ورود به حساب کاربری</h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                برای ثبت نظر واقعی و امتیازدهی به استاد، ابتدا باید وارد حساب کاربری خود شده باشید.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-teal text-white rounded-xl font-black text-xs hover:bg-teal-deep transition-all shadow-xs border-2 border-teal-800"
                >
                  ورود به حساب کاربری
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-white text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all border-2 border-slate-300"
                >
                  ثبت‌نام در سایت
                </Link>
              </div>
            </div>
          ) : !eligibility.canReview ? (
            eligibility.reason === 'already_reviewed' ? (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 border-2 border-blue-300 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-slate-900">نظر شما قبلاً ثبت شده است</h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                  شما قبلاً نظر و امتیاز خود را برای این استاد ثبت کرده‌اید. برای هر استاد امکان ثبت یک نظر وجود دارد.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  متوجه شدم
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 border-2 border-rose-300 text-rose-700 flex items-center justify-center">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-slate-900">ارتباط قبلی با استاد تایید نشد</h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                  تنها کاربرانی که واقعاً با این استاد جلسه داشته یا ارتباط برقرار کرده باشند (تماس تلفنی، پیام‌رسان‌ها یا ثبت رزرو کلاس) مجاز به ثبت نظر هستند.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs font-bold mt-1 max-w-sm text-right leading-relaxed">
                  💡 برای ثبت نظر، ابتدا از طریق شماره تماس، تلگرام، واتساپ یا دکمه رزرو کلاس با این استاد ارتباط برقرار کنید.
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {onOpenContact && (
                    <button
                      type="button"
                      onClick={() => {
                        handleReset()
                        onOpenContact()
                      }}
                      className="px-5 py-2.5 bg-teal text-white rounded-xl font-black text-xs hover:bg-teal-deep transition-all shadow-xs border-2 border-teal-800 flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>مشاهده راه‌های ارتباط با استاد</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-300 hover:bg-slate-200"
                  >
                    بستن
                  </button>
                </div>
              </div>
            )
          ) : isSuccess ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-black text-slate-900">نظر شما با موفقیت ثبت شد!</h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                از بازخورد ارزشمند شما سپاسگزاریم. دیدگاه شما پس از بررسی و تایید مدیریت در صفحه استاد منتشر خواهد شد.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 bg-teal text-white rounded-xl font-black text-sm hover:bg-teal-deep transition-all shadow-md"
              >
                بستن پنجره
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  نقش شما در ارتباط با استاد *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewerRole('parent')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all font-black flex items-center justify-center gap-2 ${
                      reviewerRole === 'parent'
                        ? 'bg-teal text-white border-teal-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>والدین دانش‌آموز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewerRole('teacher')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all font-black flex items-center justify-center gap-2 ${
                      reviewerRole === 'teacher'
                        ? 'bg-purple-700 text-white border-purple-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>معلم / همکار دوره</span>
                  </button>
                </div>
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  امتیاز شما به کیفیت تدریس و اخلاق حرفه‌ای *
                </label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                  <div className="flex items-center gap-1.5" dir="ltr">
                    {[1, 2, 3, 4, 5].map(star => {
                      const isFilled = (hoverRating || rating) >= star
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                                : 'fill-slate-200 text-slate-300'
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-xs font-black text-slate-800 mr-auto">
                    {rating === 5 && 'عالی (۵ از ۵)'}
                    {rating === 4 && 'بسیار خوب (۴ از ۵)'}
                    {rating === 3 && 'خوب (۳ از ۵)'}
                    {rating === 2 && 'متوسط (۲ از ۵)'}
                    {rating === 1 && 'ضعیف (۱ از ۵)'}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  نام و نام خانوادگی شما *
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder="مثال: سارا محمدی"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                  required
                />
              </div>

              {/* Subject or Topic */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  {reviewerRole === 'parent' ? 'درس یا پایه تحصیلی (اختیاری)' : 'سرفصل یا دوره آموزشی (اختیاری)'}
                </label>
                <input
                  type="text"
                  value={subjectOrTopic}
                  onChange={e => setSubjectOrTopic(e.target.value)}
                  placeholder={reviewerRole === 'parent' ? 'مثال: ریاضی اول دبستان' : 'مثال: کارگاه روش تدریس نوین'}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  متن دیدگاه و تجربه شما *
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="درباره نحوه تدریس، ارتباط با دانش‌آموز، انتقال مفاهیم، اثرگذاری و نظم کلاس بنویسید..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-teal text-white rounded-xl font-black text-xs hover:bg-teal-deep transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ارسال دیدگاه</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
