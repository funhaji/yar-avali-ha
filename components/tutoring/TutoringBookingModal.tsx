'use client'

import { useState, useEffect } from 'react'
import {
  X, Check, Send, Phone, MessageSquare, SendHorizontal,
  Clock, DollarSign, Calendar, MapPin, AlertCircle, CheckCircle2
} from 'lucide-react'
import { Teacher, PricingOption, TutoringGrade, TutoringSubject } from '@/lib/teachers'

interface TutoringBookingModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
  initialPricing?: PricingOption
  grades: TutoringGrade[]
  subjects: TutoringSubject[]
  defaultMode?: string
  defaultGrade?: string
  defaultSubject?: string
  defaultCity?: string
}

export function TutoringBookingModal({
  isOpen,
  onClose,
  teacher,
  initialPricing,
  grades,
  subjects,
  defaultMode = 'online',
  defaultGrade = '',
  defaultSubject = '',
  defaultCity = ''
}: TutoringBookingModalProps) {
  const [studentName, setStudentName] = useState('')
  const [phone, setPhone] = useState('')
  const [teachingMode, setTeachingMode] = useState<string>(defaultMode === 'all' ? 'online' : defaultMode)
  const [grade, setGrade] = useState<string>(defaultGrade)
  const [subject, setSubject] = useState<string>(defaultSubject)
  const [city, setCity] = useState<string>(defaultCity)
  const [preferredTime, setPreferredTime] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<number>(
    initialPricing?.duration_minutes || teacher?.pricing_options?.[0]?.duration_minutes || 60
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (teacher) {
      if (initialPricing) {
        setSelectedDuration(initialPricing.duration_minutes)
      } else if (teacher.pricing_options && teacher.pricing_options.length > 0) {
        setSelectedDuration(teacher.pricing_options[0].duration_minutes)
      }
      if (defaultMode && defaultMode !== 'all') {
        setTeachingMode(defaultMode)
      } else if (teacher.teaching_modes && teacher.teaching_modes.length > 0) {
        setTeachingMode(teacher.teaching_modes[0])
      }
      if (defaultGrade) setGrade(defaultGrade)
      if (defaultSubject) setSubject(defaultSubject)
      if (defaultCity) setCity(defaultCity)
      setIsSuccess(false)
      setError('')
    }
  }, [teacher, initialPricing, defaultMode, defaultGrade, defaultSubject, defaultCity])

  if (!isOpen || !teacher) return null

  const pricingOptions = teacher.pricing_options && teacher.pricing_options.length > 0
    ? teacher.pricing_options
    : []

  const activePricing = pricingOptions.find(p => p.duration_minutes === selectedDuration) || pricingOptions[0]

  // Filter subjects for the selected grade
  const availableSubjects = grade
    ? subjects.filter(s => {
        const matchingGrade = grades.find(g => g.name === grade)
        return matchingGrade ? s.grade_id === matchingGrade.id : true
      })
    : subjects

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentName.trim()) return setError('نام و نام خانوادگی را وارد کنید')
    if (!phone.trim()) return setError('شماره تماس معتبر الزامی است')

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tutoring/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacher?.id,
          student_name: studentName.trim(),
          phone: phone.trim(),
          teaching_mode: teachingMode,
          grade: grade || null,
          subject: subject || null,
          duration_minutes: selectedDuration || null,
          preferred_time: preferredTime.trim() || null,
          city: teachingMode === 'in_person' ? (city.trim() || null) : null,
          notes: notes.trim() || null
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت درخواست')

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت درخواست')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-deep to-teal p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {teacher.photo_url ? (
              <img
                src={teacher.photo_url}
                alt={teacher.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {teacher.name.slice(0, 1)}
              </div>
            )}
            <div>
              <h3 className="font-black text-base">{teacher.name}</h3>
              <p className="text-xs text-white/80">{teacher.specialty || 'مدرس یار اولی‌ها'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900">درخواست شما با موفقیت ثبت شد!</h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                اطلاعات شما برای استاد {teacher.name} و تیم پشتیبانی یار اولی‌ها ارسال گردید. به زودی جهت هماهنگی جلسه با شماره تماس شما ارتباط برقرار خواهد شد.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-teal text-white font-bold text-xs hover:bg-teal-deep transition-colors"
              >
                متوجه شدم
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Teaching Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">شیوه برگزاری جلسه *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTeachingMode('online')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      teachingMode === 'online'
                        ? 'bg-teal/10 border-teal text-teal'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    تدریس آنلاین (تصویری)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeachingMode('in_person')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      teachingMode === 'in_person'
                        ? 'bg-tangerine/10 border-tangerine text-tangerine'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    تدریس حضوری
                  </button>
                </div>
              </div>

              {/* Student Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نام دانش‌آموز یا ولی *</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="مثال: علی احمدی"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">شماره تماس همراه *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0912..."
                    dir="ltr"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal text-left"
                    required
                  />
                </div>
              </div>

              {/* Grade & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">پایه تحصیلی</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
                  >
                    <option value="">انتخاب پایه...</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">درس مورد نیاز</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
                  >
                    <option value="">انتخاب درس...</option>
                    {availableSubjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* In person City (if in person) */}
              {teachingMode === 'in_person' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">شهر محل سکونت جهت تدریس حضوری</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="مثال: تهران، منطقه ۲"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-tangerine"
                  />
                </div>
              )}

              {/* Duration options and price preview */}
              {pricingOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">مدت زمان جلسه و تعرفه</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pricingOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedDuration(opt.duration_minutes)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                          selectedDuration === opt.duration_minutes
                            ? 'bg-teal/5 border-teal'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800">{opt.duration_minutes} دقیقه</span>
                        <span className="text-teal font-black text-xs mt-1" dir="ltr">
                          {Number(opt.price_toman).toLocaleString('fa-IR')} ت
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Time & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">روز یا ساعت پیشنهادی شما</label>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value)}
                  placeholder="مثال: شنبه‌ها و دوشنبه‌ها بعد از ظهر"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات تکمیلی (اختیاری)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="نکات مربوط به سطح درسی دانش‌آموز، مباحث مد نظر و..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-teal hover:bg-teal-deep text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'در حال ثبت درخواست...' : 'ثبت درخواست تدریس خصوصی'}</span>
              </button>

              {/* Direct Contact Alternatives */}
              {(teacher.contact_phone || teacher.telegram_id || teacher.whatsapp_id || teacher.eitaa_id) && (
                <div className="pt-4 border-t border-slate-100 flex flex-col items-center text-center gap-2">
                  <span className="text-[11px] text-slate-400 font-bold">یا می‌توانید مستقیماً ارتباط برقرار کنید:</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {teacher.contact_phone && (
                      <a
                        href={`tel:${teacher.contact_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal" />
                        <span>تماس تلفنی</span>
                      </a>
                    )}
                    {teacher.telegram_id && (
                      <a
                        href={teacher.telegram_id.startsWith('http') ? teacher.telegram_id : `https://t.me/${teacher.telegram_id.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors"
                      >
                        <SendHorizontal className="w-3.5 h-3.5 text-sky-500" />
                        <span>تلگرام</span>
                      </a>
                    )}
                    {teacher.whatsapp_id && (
                      <a
                        href={teacher.whatsapp_id.startsWith('http') ? teacher.whatsapp_id : `https://wa.me/${teacher.whatsapp_id.replace(/^0/, '98')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>واتساپ</span>
                      </a>
                    )}
                    {teacher.eitaa_id && (
                      <a
                        href={`https://eitaa.com/${teacher.eitaa_id.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors"
                      >
                        <span>ایتا ({teacher.eitaa_id})</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
