'use client'

import { useState } from 'react'
import {
  Star, CheckCircle2, Monitor, Users, GraduationCap,
  Calendar, Clock, MapPin, ChevronLeft, ShieldCheck, Sparkles, BookOpen, Award
} from 'lucide-react'
import { Teacher, PricingOption } from '@/lib/teachers'

interface TeacherCardProps {
  teacher: Teacher
  onOpenBooking: (teacher: Teacher, selectedPricing?: PricingOption) => void
  onOpenResume: (teacher: Teacher) => void
  cardType?: 'student' | 'teacher_training'
}

export function TeacherCard({
  teacher,
  onOpenBooking,
  onOpenResume,
  cardType = 'student'
}: TeacherCardProps) {
  const isTraining = cardType === 'teacher_training'

  // Pick appropriate pricing list based on target audience
  const pricingList = isTraining
    ? (teacher.training_pricing_options && teacher.training_pricing_options.length > 0
        ? teacher.training_pricing_options
        : (teacher.pricing_options && teacher.pricing_options.length > 0 ? teacher.pricing_options : [{ duration_minutes: 60, price_toman: 0 }]))
    : (teacher.pricing_options && teacher.pricing_options.length > 0
        ? teacher.pricing_options
        : [{ duration_minutes: 60, price_toman: 0 }])

  // Selected duration index for interactive pricing chips
  const [selectedPricingIdx, setSelectedPricingIdx] = useState<number>(0)
  const currentPricing = pricingList[selectedPricingIdx] || pricingList[0]

  const rating = teacher.star_rating ?? 5.0
  const reviews = teacher.review_count ?? 0
  const sessions = teacher.successful_sessions ?? 0

  return (
    <article className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-300 shadow-md hover:border-teal hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header: Avatar, Name, Verification, Rating */}
        <div className="flex items-start gap-4 sm:gap-5 mb-5">
          <div className="relative flex-shrink-0">
            {teacher.photo_url ? (
              <img
                src={teacher.photo_url}
                alt={teacher.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-teal/40 shadow-xs group-hover:border-teal transition-colors"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-500 font-black text-xl">
                {teacher.name.slice(0, 1)}
              </div>
            )}
            <span
              className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="استاد تایید شده"
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

            {isTraining ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 text-xs font-black mb-2 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                <span>مدرس دوره تربیت معلم</span>
              </span>
            ) : teacher.badge_text ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-teal/10 text-teal-900 border border-teal/30 text-xs font-black mb-2 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>{teacher.badge_text}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border-2 border-slate-200 text-xs font-bold mb-2 shadow-xs">
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
                    className={`w-4 h-4 ${
                      star <= Math.round(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-black text-slate-900">{rating} از ۵</span>
              {reviews > 0 && (
                <span className="text-slate-500 font-bold text-xs">
                  ({reviews} نظر واقعی)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Teaching Mode & Successful Sessions Bar */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800">
            <Monitor className="w-4 h-4 text-teal flex-shrink-0" />
            <span className="truncate">
              {teacher.teaching_modes?.includes('in_person') && teacher.teaching_modes?.includes('online')
                ? 'تدریس آنلاین و حضوری'
                : teacher.teaching_modes?.includes('in_person')
                ? 'تدریس حضوری'
                : 'تدریس آنلاین'}
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800">
            {isTraining ? (
              <>
                <GraduationCap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="truncate">آموزش تخصصی معلمان</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-tangerine flex-shrink-0" />
                <span className="truncate">
                  {sessions > 0 ? `${sessions.toLocaleString('fa-IR')} جلسه موفق` : 'آماده برگزاری کلاس'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Education & Workplace */}
        {(teacher.education || teacher.workplace) && (
          <div className="flex items-start gap-2.5 text-xs text-slate-800 font-bold mb-4 bg-teal/5 p-3.5 rounded-2xl border-2 border-teal/20">
            <GraduationCap className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {teacher.education} {teacher.workplace ? `• ${teacher.workplace}` : ''}
            </span>
          </div>
        )}

        {/* Training Certificate if in training mode */}
        {isTraining && teacher.training_certificate && (
          <div className="flex items-center gap-2 text-xs font-black text-purple-900 bg-purple-50 p-3 rounded-2xl border-2 border-purple-200 mb-4">
            <Award className="w-4 h-4 text-purple-700 flex-shrink-0" />
            <span>گواهی دوره: {teacher.training_certificate}</span>
          </div>
        )}

        {/* Training Topics (for teachers) OR Grades & Subjects (for students) */}
        {isTraining ? (
          teacher.training_topics && teacher.training_topics.length > 0 && (
            <div className="flex flex-col gap-2 mb-4 p-3 bg-purple-50/50 rounded-2xl border-2 border-purple-200">
              <span className="text-[11px] font-black text-purple-900">سرفصل‌های تربیت معلم:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {teacher.training_topics.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-white text-purple-900 border border-purple-300 text-xs font-bold shadow-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )
        ) : (
          ((teacher.grades && teacher.grades.length > 0) || (teacher.subjects && teacher.subjects.length > 0)) && (
            <div className="flex flex-col gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
              {teacher.grades && teacher.grades.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black text-slate-500">پایه‌ها:</span>
                  {teacher.grades.map(g => (
                    <span key={g} className="px-2 py-0.5 rounded-lg bg-teal/10 text-teal-900 border border-teal/20 text-xs font-black">
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black text-slate-500">دروس:</span>
                  {teacher.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-white text-slate-800 border border-slate-300 text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* Training Target Levels (if in training mode) */}
        {isTraining && teacher.training_target_levels && teacher.training_target_levels.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Users className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span className="font-black text-slate-800">مخاطبان:</span>
            <span className="truncate font-medium">{teacher.training_target_levels.join('، ')}</span>
          </div>
        )}

        {/* Bullet Highlights */}
        {teacher.highlights && teacher.highlights.length > 0 && (
          <ul className="flex flex-col gap-2 mb-5 text-xs text-slate-700">
            {teacher.highlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 mt-1.5"></span>
                <span className="leading-relaxed line-clamp-1 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Section: Pricing Duration Chips + Price Tag + Actions */}
      <div className="pt-4 border-t-2 border-slate-200">
        {/* Duration selector chips */}
        {pricingList.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3.5 overflow-x-auto pb-1">
            <span className="text-xs font-black text-slate-500 whitespace-nowrap">مدت / نوع:</span>
            {pricingList.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPricingIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap border-2 ${
                  selectedPricingIdx === idx
                    ? 'bg-teal text-white border-teal-700 font-black shadow-xs'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                }`}
              >
                {p.title ? p.title : `${p.duration_minutes} دقیقه`}
              </button>
            ))}
          </div>
        )}

        {/* Price Display */}
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs text-slate-600 font-bold">
            {isTraining ? 'تعرفه آموزش معلمان:' : 'هزینه هر جلسه:'}
          </span>
          <div>
            {currentPricing?.price_toman > 0 ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-teal-800 tracking-tight" dir="ltr">
                  {Number(currentPricing.price_toman).toLocaleString('fa-IR')}
                </span>
                <span className="text-xs font-black text-slate-700">
                  تومان ({currentPricing.title || `${currentPricing.duration_minutes} دقیقه`})
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-700">هماهنگی پس از درخواست</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenResume(teacher)}
            className="py-2.5 px-3 rounded-2xl text-xs font-black text-slate-800 bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 shadow-xs transition-all text-center"
          >
            {isTraining ? 'سوابق و نظرات' : 'رزومه و نظرات'}
          </button>

          <button
            type="button"
            onClick={() => onOpenBooking(teacher, currentPricing)}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black text-white border-2 shadow-sm hover:shadow transition-all text-center flex items-center justify-center gap-1 ${
              isTraining
                ? 'bg-purple-700 hover:bg-purple-800 border-purple-900'
                : 'bg-teal hover:bg-teal-deep border-teal-700'
            }`}
          >
            <span>{isTraining ? 'ثبت‌نام دوره' : 'انتخاب استاد'}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
