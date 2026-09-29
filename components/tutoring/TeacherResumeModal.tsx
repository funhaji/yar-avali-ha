'use client'

import { useState, useEffect } from 'react'
import {
  X, Star, GraduationCap, MapPin, Briefcase, Award,
  Calendar, Clock, Phone, SendHorizontal, MessageSquare,
  CheckCircle2, ChevronLeft, Video, BookOpen, Users, PlusCircle,
  MessageCircle
} from 'lucide-react'
import { Teacher, TeacherReview } from '@/lib/teachers'
import { getEmbedUrl } from '@/lib/video'
import { TeacherReviewFormModal } from './TeacherReviewFormModal'

interface TeacherResumeModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
  onOpenBooking: (teacher: Teacher) => void
  initialTab?: 'resume' | 'training' | 'reviews'
}

export function TeacherResumeModal({
  isOpen,
  onClose,
  teacher,
  onOpenBooking,
  initialTab = 'resume'
}: TeacherResumeModalProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'training' | 'reviews'>(initialTab)
  const [reviews, setReviews] = useState<TeacherReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'parent' | 'teacher'>('all')
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  function loadReviews() {
    if (!teacher) return
    setReviewsLoading(true)
    fetch(`/api/teachers/${teacher.id}/reviews`)
      .then(res => res.json())
      .then(d => {
        if (d.reviews) {
          setReviews(d.reviews)
        }
        setReviewsLoading(false)
      })
      .catch(() => setReviewsLoading(false))
  }

  useEffect(() => {
    if (isOpen && teacher) {
      loadReviews()
    }
  }, [isOpen, teacher?.id])

  if (!isOpen || !teacher) return null

  const rating = teacher.star_rating ?? 5.0
  const reviewCount = reviews.length > 0 ? reviews.length : (teacher.review_count ?? 0)
  const sessions = teacher.successful_sessions ?? 0

  const hasTraining = teacher.teaching_scope === 'teachers' || teacher.teaching_scope === 'both' || (teacher.training_topics && teacher.training_topics.length > 0)

  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'all') return true
    return r.reviewer_role === reviewFilter
  })

  const parentReviewsCount = reviews.filter(r => r.reviewer_role === 'parent').length
  const teacherReviewsCount = reviews.filter(r => r.reviewer_role === 'teacher').length

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-deep to-teal p-6 text-white flex items-center justify-between flex-shrink-0 border-b-2 border-teal-700">
            <div className="flex items-center gap-4">
              {teacher.photo_url ? (
                <img
                  src={teacher.photo_url}
                  alt={teacher.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center font-black text-2xl">
                  {teacher.name.slice(0, 1)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black">{teacher.name}</h2>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-lg font-black border border-white/30">
                    {teacher.badge_text || 'استاد تایید شده'}
                  </span>
                  {hasTraining && (
                    <span className="text-xs bg-purple-900/40 text-purple-100 px-2 py-0.5 rounded-lg font-bold border border-purple-300/40">
                      مدرس تربیت معلم
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/90 font-medium mt-1">{teacher.specialty || 'مدرس یار اولی‌ها'}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-300">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(rating)
                            ? 'fill-amber-300 text-amber-300'
                            : 'fill-white/20 text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-black text-white">{rating} از ۵</span>
                  {reviewCount > 0 && <span className="text-white/80 text-xs font-medium">({reviewCount} نظر واقعی)</span>}
                  {sessions > 0 && <span className="text-white/80 text-xs font-medium">• {sessions} جلسه موفق</span>}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors text-white border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Bar inside Modal */}
          <div className="bg-slate-100 px-6 py-2.5 border-b-2 border-slate-200 flex items-center gap-2 text-xs font-bold overflow-x-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('resume')}
              className={`px-3.5 py-1.5 rounded-xl transition-all border-2 ${
                activeTab === 'resume'
                  ? 'bg-teal text-white border-teal-700 font-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
              }`}
            >
              رزومه و سوابق
            </button>

            {hasTraining && (
              <button
                type="button"
                onClick={() => setActiveTab('training')}
                className={`px-3.5 py-1.5 rounded-xl transition-all border-2 flex items-center gap-1.5 ${
                  activeTab === 'training'
                    ? 'bg-purple-700 text-white border-purple-900 font-black shadow-xs'
                    : 'bg-white text-purple-950 border-purple-300 hover:border-purple-400'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>دوره تربیت معلم</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-3.5 py-1.5 rounded-xl transition-all border-2 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-amber-600 text-white border-amber-800 font-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>نظرات و امتیازات ({reviews.length})</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto flex flex-col gap-6 text-slate-800 flex-1">
            {/* TAB 1: RESUME & CREDENTIALS */}
            {activeTab === 'resume' && (
              <>
                {/* Video Introduction if available */}
                {teacher.video_url && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                      <Video className="w-4 h-4 text-teal" />
                      <span>ویدیوی معرفی استاد</span>
                    </div>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border-2 border-slate-300">
                      <iframe
                        src={getEmbedUrl(teacher.video_url)}
                        className="w-full h-full border-none"
                        allowFullScreen
                        allow="autoplay; fullscreen"
                      />
                    </div>
                  </div>
                )}

                {/* Bio text */}
                {teacher.bio && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2">درباره استاد</h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                      {teacher.bio}
                    </p>
                  </div>
                )}

                {/* Experience & Ranks Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <span className="block text-lg font-black text-teal-800">
                      {teacher.experience_years ? `${teacher.experience_years} سال` : 'سابقه‌دار'}
                    </span>
                    <span className="text-[11px] text-slate-600 font-bold">تجربه تدریس</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <span className="block text-lg font-black text-teal-800">
                      {teacher.national_rank ? `رتبه ${teacher.national_rank}` : 'برتر'}
                    </span>
                    <span className="text-[11px] text-slate-600 font-bold">رتبه کشوری</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <span className="block text-lg font-black text-teal-800">
                      {teacher.provincial_rank ? `رتبه ${teacher.provincial_rank}` : 'نمونه'}
                    </span>
                    <span className="text-[11px] text-slate-600 font-bold">رتبه استانی</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <span className="block text-lg font-black text-teal-800">
                      {sessions > 0 ? `${sessions} جلسه` : 'فعال'}
                    </span>
                    <span className="text-[11px] text-slate-600 font-bold">جلسات موفق</span>
                  </div>
                </div>

                {/* Education and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {teacher.education && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                      <GraduationCap className="w-4 h-4 text-teal flex-shrink-0" />
                      <span className="font-medium">{teacher.education}</span>
                    </div>
                  )}

                  {teacher.workplace && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                      <Briefcase className="w-4 h-4 text-teal flex-shrink-0" />
                      <span className="font-medium">{teacher.workplace}</span>
                    </div>
                  )}

                  {teacher.location && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                      <MapPin className="w-4 h-4 text-teal flex-shrink-0" />
                      <span className="font-medium">شهر محل سکونت: {teacher.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">
                      {teacher.teaching_modes?.includes('in_person') && teacher.teaching_modes?.includes('online')
                        ? 'تدریس حضوری و آنلاین'
                        : teacher.teaching_modes?.includes('in_person')
                        ? 'تدریس حضوری'
                        : 'تدریس آنلاین'}
                    </span>
                  </div>
                </div>

                {/* Grades & Subjects */}
                {((teacher.grades && teacher.grades.length > 0) || (teacher.subjects && teacher.subjects.length > 0)) && (
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col gap-3">
                    {teacher.grades && teacher.grades.length > 0 && (
                      <div>
                        <span className="text-xs font-black text-slate-900 block mb-1.5">پایه‌های تحصیلی تدریس:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {teacher.grades.map(g => (
                            <span key={g} className="px-2.5 py-1 rounded-xl bg-teal/10 text-teal-900 border border-teal/20 text-xs font-black">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div>
                        <span className="text-xs font-black text-slate-900 block mb-1.5">دروس تحت پوشش:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {teacher.subjects.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded-xl bg-white text-slate-800 border border-slate-300 text-xs font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Student Pricing Options */}
                {teacher.pricing_options && teacher.pricing_options.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2">تعرفه‌های جلسات تدریس دانش‌آموزان</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {teacher.pricing_options.map((p, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {p.title || `جلسه ${p.duration_minutes} دقیقه‌ای`}
                          </span>
                          <span className="text-sm font-black text-teal-800" dir="ltr">
                            {Number(p.price_toman).toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Social Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {teacher.contact_phone && (
                    <a
                      href={`tel:${teacher.contact_phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal" />
                      <span>تماس: {teacher.contact_phone}</span>
                    </a>
                  )}
                  {teacher.telegram_id && (
                    <a
                      href={teacher.telegram_id.startsWith('http') ? teacher.telegram_id : `https://t.me/${teacher.telegram_id.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-900 text-xs font-bold transition-all shadow-xs"
                    >
                      <SendHorizontal className="w-3.5 h-3.5 text-sky-600" />
                      <span>تلگرام</span>
                    </a>
                  )}
                  {teacher.whatsapp_id && (
                    <a
                      href={teacher.whatsapp_id.startsWith('http') ? teacher.whatsapp_id : `https://wa.me/${teacher.whatsapp_id.replace(/^0/, '98')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs font-bold transition-all shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>واتساپ</span>
                    </a>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: TEACHER TRAINING */}
            {activeTab === 'training' && (
              <div className="flex flex-col gap-5">
                {/* Training Video if available */}
                {teacher.training_video_url && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-900">
                      <Video className="w-4 h-4 text-purple-700" />
                      <span>ویدیوی معرفی دوره و شیوه تدریس به همکاران</span>
                    </div>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border-2 border-purple-200">
                      <iframe
                        src={getEmbedUrl(teacher.training_video_url)}
                        className="w-full h-full border-none"
                        allowFullScreen
                        allow="autoplay; fullscreen"
                      />
                    </div>
                  </div>
                )}

                {/* Training Bio */}
                {teacher.training_bio && (
                  <div>
                    <h3 className="text-xs font-black text-purple-950 mb-2">اهداف و رویکرد دوره تربیت معلم</h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-purple-50/50 p-4 rounded-2xl border-2 border-purple-200">
                      {teacher.training_bio}
                    </p>
                  </div>
                )}

                {/* Certificate */}
                {teacher.training_certificate && (
                  <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 flex items-center gap-3">
                    <Award className="w-7 h-7 text-purple-700 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-purple-950 block">مدرک و گواهی پایان دوره:</span>
                      <span className="text-xs font-bold text-slate-700">{teacher.training_certificate}</span>
                    </div>
                  </div>
                )}

                {/* Training Topics */}
                {teacher.training_topics && teacher.training_topics.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2">سرفصل‌ها و موضوعات تخصصی تربیت معلم</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {teacher.training_topics.map((topic, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border-2 border-purple-200 text-xs font-bold text-slate-800 flex items-center gap-2 shadow-xs">
                          <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience Levels */}
                {teacher.training_target_levels && teacher.training_target_levels.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2">مخاطبان هدف دوره</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.training_target_levels.map((level, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 text-xs font-black">
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Training Pricing Options */}
                {teacher.training_pricing_options && teacher.training_pricing_options.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2">تعرفه‌ها و پکیج‌های تربیت معلم</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {teacher.training_pricing_options.map((p, idx) => (
                        <div key={idx} className="p-4 bg-purple-50/50 rounded-2xl border-2 border-purple-200 flex flex-col gap-1">
                          <span className="text-xs font-black text-purple-950">
                            {p.title || `پکیج آموزشی (${p.duration_minutes} دقیقه)`}
                          </span>
                          <span className="text-sm font-black text-purple-800" dir="ltr">
                            {Number(p.price_toman).toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: REVIEWS & REAL RATINGS */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-5">
                {/* Header summary & action */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 font-black text-lg">
                      {rating}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-600 font-bold mt-0.5 block">
                        بر اساس {reviews.length} دیدگاه ثبت شده واقعی
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal text-white hover:bg-teal-deep font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>ثبت نظر و تجربه شما</span>
                  </button>
                </div>

                {/* Filter chips */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-black text-slate-600">فیلتر دیدگاه‌ها:</span>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        reviewFilter === 'all'
                          ? 'bg-slate-900 text-white border-slate-900 font-black'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 font-bold'
                      }`}
                    >
                      همه ({reviews.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('parent')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        reviewFilter === 'parent'
                          ? 'bg-emerald-700 text-white border-emerald-900 font-black'
                          : 'bg-white text-emerald-800 border-emerald-300 hover:border-emerald-400 font-bold'
                      }`}
                    >
                      والدین ({parentReviewsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('teacher')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        reviewFilter === 'teacher'
                          ? 'bg-purple-700 text-white border-purple-900 font-black'
                          : 'bg-white text-purple-900 border-purple-300 hover:border-purple-400 font-bold'
                      }`}
                    >
                      معلمان و همکاران ({teacherReviewsCount})
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="py-8 text-center text-xs font-bold text-slate-500">
                    در حال بارگذاری نظرات...
                  </div>
                ) : filteredReviews.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {filteredReviews.map(r => (
                      <div
                        key={r.id}
                        className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col gap-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{r.reviewer_name}</span>
                            {r.reviewer_role === 'parent' ? (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                والدین دانش‌آموز
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                                معلم / همکار دوره
                              </span>
                            )}
                            {r.subject_or_topic && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                ({r.subject_or_topic})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= r.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-200 text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                          {r.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6">
                    <MessageCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-black text-slate-800">
                      {reviewFilter === 'all'
                        ? 'هنوز دیدگاهی برای این استاد ثبت نشده است.'
                        : 'دیدگاهی در این دسته‌بندی یافت نشد.'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      اولین نفری باشید که تجربه خود را ثبت می‌کنید.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(true)}
                      className="mt-3 px-4 py-2 bg-teal text-white rounded-xl text-xs font-black hover:bg-teal-deep transition-all"
                    >
                      ثبت اولین نظر
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Book Button */}
          <div className="p-4 bg-slate-100 border-t-2 border-slate-300 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-black text-slate-700 hover:text-slate-950 transition-colors"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenBooking(teacher)
              }}
              className="px-6 py-2.5 rounded-2xl bg-teal hover:bg-teal-deep border-2 border-teal-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>{hasTraining && activeTab === 'training' ? 'ثبت‌نام دوره تربیت معلم' : `درخواست کلاس با ${teacher.name}`}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <TeacherReviewFormModal
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        teacher={teacher}
        onSuccess={() => {
          loadReviews()
        }}
      />
    </>
  )
}
