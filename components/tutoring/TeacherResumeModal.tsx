'use client'

import {
  X, Star, GraduationCap, MapPin, Briefcase, Award,
  Calendar, Clock, Phone, SendHorizontal, MessageSquare,
  CheckCircle2, ChevronLeft, Video
} from 'lucide-react'
import { Teacher } from '@/lib/teachers'
import { getEmbedUrl } from '@/lib/video'

interface TeacherResumeModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
  onOpenBooking: (teacher: Teacher) => void
}

export function TeacherResumeModal({
  isOpen,
  onClose,
  teacher,
  onOpenBooking
}: TeacherResumeModalProps) {
  if (!isOpen || !teacher) return null

  const rating = teacher.star_rating ?? 5.0
  const reviews = teacher.review_count ?? 0
  const sessions = teacher.successful_sessions ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{teacher.name}</h2>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-lg font-black border border-white/30">
                  {teacher.badge_text || 'استاد تایید شده'}
                </span>
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
                {reviews > 0 && <span className="text-white/80 text-xs font-medium">({reviews} دیدگاه)</span>}
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-slate-800">
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

          {/* Bio */}
          {teacher.bio && (
            <div className="bg-slate-50 p-4.5 rounded-2xl border-2 border-slate-200">
              <h3 className="text-xs font-black text-slate-900 mb-1.5">درباره استاد</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                {teacher.bio}
              </p>
            </div>
          )}

          {/* Professional Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teacher.education && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal/5 border-2 border-teal/20 text-xs">
                <GraduationCap className="w-5 h-5 text-teal flex-shrink-0" />
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">مدرک تحصیلی:</span>
                  <span className="font-black text-slate-900">{teacher.education}</span>
                </div>
              </div>
            )}
            {teacher.workplace && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs">
                <Briefcase className="w-5 h-5 text-tangerine flex-shrink-0" />
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">محل خدمت:</span>
                  <span className="font-black text-slate-900">{teacher.workplace}</span>
                </div>
              </div>
            )}
            {teacher.location && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs">
                <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">موقعیت مکانی:</span>
                  <span className="font-black text-slate-900">{teacher.location}</span>
                </div>
              </div>
            )}
            {teacher.experience_years ? (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs">
                <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">سابقه تدریس:</span>
                  <span className="font-black text-slate-900">{teacher.experience_years} سال</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Ranks (if any) */}
          {(teacher.national_rank || teacher.provincial_rank || teacher.district_rank) && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-around text-center text-xs shadow-xs">
              {teacher.national_rank ? (
                <div>
                  <span className="block font-black text-amber-900 text-lg">رتبه {teacher.national_rank}</span>
                  <span className="text-xs text-amber-800 font-bold">کشوری</span>
                </div>
              ) : null}
              {teacher.provincial_rank ? (
                <div>
                  <span className="block font-black text-amber-900 text-lg">رتبه {teacher.provincial_rank}</span>
                  <span className="text-xs text-amber-800 font-bold">استانی</span>
                </div>
              ) : null}
              {teacher.district_rank ? (
                <div>
                  <span className="block font-black text-amber-900 text-lg">رتبه {teacher.district_rank}</span>
                  <span className="text-xs text-amber-800 font-bold">ناحیه</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Key Highlights */}
          {teacher.highlights && teacher.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-900 mb-2.5">سوابق و افتخارات برجسته</h3>
              <ul className="flex flex-col gap-2 text-xs">
                {teacher.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-slate-800 font-medium">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing Options */}
          {teacher.pricing_options && teacher.pricing_options.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-900 mb-2.5">تعرفه جلسات تدریس</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {teacher.pricing_options.map((opt, i) => (
                  <div key={i} className="p-3.5 bg-teal/5 border-2 border-teal/30 rounded-2xl text-center shadow-xs">
                    <span className="text-xs font-bold text-slate-700 block">{opt.duration_minutes} دقیقه</span>
                    <span className="text-sm font-black text-teal-800 mt-1 block" dir="ltr">
                      {Number(opt.price_toman).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability Schedule */}
          {teacher.availability_schedule && (
            <div className="bg-slate-50 p-4.5 rounded-2xl border-2 border-slate-200 text-xs">
              <h3 className="font-black text-slate-900 mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-tangerine" />
                <span>برنامه زمان‌بندی و روزهای حضور</span>
              </h3>
              {teacher.availability_schedule.days && teacher.availability_schedule.days.length > 0 && (
                <div className="mb-2">
                  <span className="text-slate-500 font-bold">روزهای فعالیت: </span>
                  <span className="font-black text-slate-800">{teacher.availability_schedule.days.join('، ')}</span>
                </div>
              )}
              {teacher.availability_schedule.hours && (
                <div className="mb-2">
                  <span className="text-slate-500 font-bold">ساعات کاری: </span>
                  <span className="font-black text-slate-800">{teacher.availability_schedule.hours}</span>
                </div>
              )}
              {teacher.availability_schedule.notes && (
                <p className="text-slate-600 text-xs font-medium leading-relaxed mt-1">
                  نکته: {teacher.availability_schedule.notes}
                </p>
              )}
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
            {teacher.instagram_id && (
              <a
                href={teacher.instagram_id.startsWith('http') ? teacher.instagram_id : `https://instagram.com/${teacher.instagram_id.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-300 text-pink-900 text-xs font-bold transition-all shadow-xs"
              >
                <svg className="w-3.5 h-3.5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>اینستاگرام</span>
              </a>
            )}
          </div>
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
            <span>درخواست کلاس با {teacher.name}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
