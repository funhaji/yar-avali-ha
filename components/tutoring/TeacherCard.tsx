'use client'

import { useState } from 'react'
import {
  Star, CheckCircle2, Monitor, Users, GraduationCap,
  Calendar, Clock, MapPin, ChevronLeft, ShieldCheck, Sparkles
} from 'lucide-react'
import { Teacher, PricingOption } from '@/lib/teachers'

interface TeacherCardProps {
  teacher: Teacher
  onOpenBooking: (teacher: Teacher, selectedPricing?: PricingOption) => void
  onOpenResume: (teacher: Teacher) => void
}

export function TeacherCard({ teacher, onOpenBooking, onOpenResume }: TeacherCardProps) {
  const pricingList = teacher.pricing_options && teacher.pricing_options.length > 0
    ? teacher.pricing_options
    : [{ duration_minutes: 60, price_toman: 0 }]

  // Selected duration index for interactive pricing chips
  const [selectedPricingIdx, setSelectedPricingIdx] = useState<number>(0)
  const currentPricing = pricingList[selectedPricingIdx] || pricingList[0]

  const rating = teacher.star_rating ?? 5.0
  const reviews = teacher.review_count ?? 0
  const sessions = teacher.successful_sessions ?? 0

  return (
    <article className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header: Avatar, Name, Verification, Rating */}
        <div className="flex items-start gap-4 sm:gap-5 mb-5">
          <div className="relative flex-shrink-0">
            {teacher.photo_url ? (
              <img
                src={teacher.photo_url}
                alt={teacher.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-teal/20 shadow-sm group-hover:border-teal transition-colors"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 font-black text-xl">
                {teacher.name.slice(0, 1)}
              </div>
            )}
            <span
              className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="استاد فعال"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                {teacher.name}
              </h3>
            </div>

            {teacher.badge_text ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal/10 text-teal text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{teacher.badge_text}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                <span>استاد تایید شده</span>
              </span>
            )}

            {/* Star Rating & Review Count */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-black text-slate-700">{rating} از ۵</span>
              {reviews > 0 && (
                <span className="text-slate-400 text-[11px]">
                  ({reviews} دیدگاه دانش‌آموزان)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Teaching Mode & Successful Sessions Bar */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
            <Monitor className="w-4 h-4 text-teal flex-shrink-0" />
            <span className="truncate">
              {teacher.teaching_modes?.includes('in_person') && teacher.teaching_modes?.includes('online')
                ? 'تدریس آنلاین و حضوری'
                : teacher.teaching_modes?.includes('in_person')
                ? 'تدریس حضوری'
                : 'تدریس آنلاین'}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
            <Users className="w-4 h-4 text-tangerine flex-shrink-0" />
            <span className="truncate">
              {sessions > 0 ? `${sessions.toLocaleString('fa-IR')} جلسه موفق` : 'آماده برگزاری کلاس'}
            </span>
          </div>
        </div>

        {/* Education & Workplace */}
        {(teacher.education || teacher.workplace) && (
          <div className="flex items-start gap-2 text-xs text-slate-700 font-medium mb-4 bg-teal/5 p-3 rounded-2xl border border-teal/10">
            <GraduationCap className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {teacher.education} {teacher.workplace ? `• ${teacher.workplace}` : ''}
            </span>
          </div>
        )}

        {/* Bullet Highlights */}
        {teacher.highlights && teacher.highlights.length > 0 && (
          <ul className="flex flex-col gap-1.5 mb-5 text-xs text-slate-600">
            {teacher.highlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0 mt-1.5"></span>
                <span className="leading-relaxed line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Availability Schedule preview */}
        {teacher.availability_schedule?.days && teacher.availability_schedule.days.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-bold text-slate-600">روزهای حضور:</span>
            <span className="truncate">{teacher.availability_schedule.days.join('، ')}</span>
            {teacher.availability_schedule.hours && (
              <span className="text-slate-400">({teacher.availability_schedule.hours})</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Pricing Duration Chips + Price Tag + Actions */}
      <div className="pt-4 border-t border-slate-100">
        {/* Duration selector chips (if more than 1 option) */}
        {pricingList.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">مدت جلسه:</span>
            {pricingList.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPricingIdx(idx)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedPricingIdx === idx
                    ? 'bg-teal text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.duration_minutes} دقیقه
              </button>
            ))}
          </div>
        )}

        {/* Price Display */}
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs text-slate-500 font-bold">هزینه هر جلسه:</span>
          <div>
            {currentPricing?.price_toman > 0 ? (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-teal tracking-tight" dir="ltr">
                  {Number(currentPricing.price_toman).toLocaleString('fa-IR')}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  تومان ({currentPricing.duration_minutes} دقیقه)
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-600">هماهنگی پس از درخواست</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenResume(teacher)}
            className="py-2.5 px-3 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
          >
            رزومه و معرفی
          </button>

          <button
            type="button"
            onClick={() => onOpenBooking(teacher, currentPricing)}
            className="py-2.5 px-3 rounded-2xl text-xs font-bold text-white bg-teal hover:bg-teal-deep shadow-sm hover:shadow transition-all text-center flex items-center justify-center gap-1"
          >
            <span>انتخاب استاد</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}
