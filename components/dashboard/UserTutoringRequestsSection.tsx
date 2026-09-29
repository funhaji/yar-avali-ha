'use client'

import Link from 'next/link'
import { 
  GraduationCap, Calendar, Clock, MapPin, CheckCircle2, 
  AlertCircle, ChevronLeft, Phone, User, BookOpen, Sparkles
} from 'lucide-react'

export interface UserTutoringRequestItem {
  id: string
  teacher_id: string
  teacher_name?: string
  teacher_photo?: string | null
  teacher_specialty?: string | null
  student_name: string
  phone: string
  teaching_mode: string
  teaching_type?: 'student' | 'teacher_training' | null
  grade?: string | null
  subject?: string | null
  duration_minutes?: number | null
  preferred_time?: string | null
  city?: string | null
  notes?: string | null
  status: string
  created_at: string | Date
}

interface Props {
  requests: UserTutoringRequestItem[]
}

export function UserTutoringRequestsSection({ requests }: Props) {
  function getStatusBadge(status: string) {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border-2 border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            تایید شده (در حال هماهنگی)
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-blue-100 text-blue-900 border-2 border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
            جلسه برگزار شد
          </span>
        )
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-900 border-2 border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
            لغو شده
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            در انتظار بررسی مشاور
          </span>
        )
    }
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="card p-8 rounded-3xl border-2 border-slate-300 bg-white text-center shadow-xs flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-teal/10 border-2 border-teal/20 text-teal flex items-center justify-center">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-slate-900">هنوز درخواستی برای تدریس یا تربیت معلم ثبت نکرده‌اید</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md font-medium leading-relaxed">
          برای ارتقای تحصیلی فرزندتان یا شرکت در دوره‌های تخصصی تربیت معلم، می‌توانید از میان برترین معلمان کشوری استاد مورد نظر خود را انتخاب کنید.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/teacher-training"
            className="px-5 py-2.5 rounded-xl bg-teal text-white font-black text-xs hover:bg-teal-deep border-2 border-teal-800 shadow-xs transition-all flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>رزرو کلاس و تربیت معلم</span>
          </Link>
          <Link
            href="/teachers"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-800 font-bold text-xs hover:bg-slate-100 border-2 border-slate-300 shadow-xs transition-all"
          >
            مشاهده لیست همه معلمان
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-teal" />
          <span>درخواست‌های تدریس و کلاس‌های من ({requests.length})</span>
        </h3>
        <Link
          href="/teacher-training"
          className="text-xs font-black text-teal hover:text-teal-deep flex items-center gap-1 hover:underline"
        >
          <span>رزرو کلاس جدید</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 shadow-xs transition-all flex flex-col gap-4"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                {req.teacher_photo ? (
                  <img
                    src={req.teacher_photo}
                    alt={req.teacher_name || 'استاد'}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-slate-300 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-teal/15 text-teal flex items-center justify-center font-black text-base border-2 border-teal/30 shrink-0">
                    {req.teacher_name ? req.teacher_name.slice(0, 1) : 'م'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      استاد: {req.teacher_name || 'انتخاب نشده'}
                    </span>
                    {req.teaching_type === 'teacher_training' ? (
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-purple-100 text-purple-950 border border-purple-300">
                        دوره تربیت معلم
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-teal/10 text-teal-900 border border-teal/20">
                        تدریس خصوصی دانش‌آموز
                      </span>
                    )}
                  </div>
                  {req.teacher_specialty && (
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {req.teacher_specialty}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(req.status)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-1">دانش‌آموز / متقاضی:</span>
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {req.student_name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">پایه و درس / مبحث:</span>
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {req.grade || req.subject ? `${req.grade || ''} ${req.subject ? `• ${req.subject}` : ''}` : 'عمومی / تربیت معلم'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">شیوه برگزاری:</span>
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal" />
                  {req.teaching_mode === 'in_person' ? 'حضوری' : 'آنلاین (سراسر کشور)'}
                  {req.duration_minutes ? ` (${req.duration_minutes} دقیقه)` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">تاریخ ثبت درخواست:</span>
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(req.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>

            {/* Notes or city if available */}
            {(req.city || req.preferred_time || req.notes) && (
              <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap gap-x-4 gap-y-1">
                {req.city && (
                  <span className="flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    شهر: {req.city}
                  </span>
                )}
                {req.preferred_time && (
                  <span className="flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    زمان ترجیحی: {req.preferred_time}
                  </span>
                )}
                {req.notes && (
                  <span className="w-full text-slate-600 mt-1 font-medium leading-relaxed">
                    توضیحات: {req.notes}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-bold">
                شناسه درخواست: <span className="font-mono text-slate-800">{req.id.slice(0, 8)}</span>
              </span>
              {req.teacher_id && (
                <Link
                  href={`/teachers/${req.teacher_id}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-teal-deep hover:text-teal hover:underline"
                >
                  <span>مشاهده پروفایل و راه‌های ارتباط با این استاد</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
