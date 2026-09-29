'use client'

import { useState, useEffect } from 'react'
import {
  X, Check, Send, Phone, MessageSquare, SendHorizontal,
  Clock, DollarSign, Calendar, MapPin, AlertCircle, CheckCircle2,
  GraduationCap, BookOpen
} from 'lucide-react'
import { Teacher, PricingOption, TutoringGrade, TutoringSubject } from '@/lib/teachers'

interface TutoringBookingModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
  initialPricing?: PricingOption
  grades?: TutoringGrade[]
  subjects?: TutoringSubject[]
  defaultMode?: string
  defaultGrade?: string
  defaultSubject?: string
  defaultCity?: string
  bookingType?: 'student' | 'teacher_training'
}

export function TutoringBookingModal({
  isOpen,
  onClose,
  teacher,
  initialPricing,
  grades = [],
  subjects = [],
  defaultMode = 'online',
  defaultGrade = '',
  defaultSubject = '',
  defaultCity = '',
  bookingType = 'student'
}: TutoringBookingModalProps) {
  const isTraining = bookingType === 'teacher_training'

  const [applicantName, setApplicantName] = useState('')
  const [phone, setPhone] = useState('')
  const [teachingMode, setTeachingMode] = useState<string>(defaultMode === 'all' ? 'online' : defaultMode)
  const [grade, setGrade] = useState<string>(defaultGrade)
  const [subject, setSubject] = useState<string>(defaultSubject)
  const [trainingTopic, setTrainingTopic] = useState<string>('')
  const [city, setCity] = useState<string>(defaultCity)
  const [preferredTime, setPreferredTime] = useState('')
  const [notes, setNotes] = useState('')

  const pricingOptions = isTraining
    ? (teacher?.training_pricing_options && teacher.training_pricing_options.length > 0
        ? teacher.training_pricing_options
        : (teacher?.pricing_options || []))
    : (teacher?.pricing_options || [])

  const [selectedDuration, setSelectedDuration] = useState<number>(
    initialPricing?.duration_minutes || pricingOptions[0]?.duration_minutes || 60
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (teacher) {
      if (initialPricing) {
        setSelectedDuration(initialPricing.duration_minutes)
      } else if (pricingOptions.length > 0) {
        setSelectedDuration(pricingOptions[0].duration_minutes)
      }
      if (defaultMode && defaultMode !== 'all') {
        setTeachingMode(defaultMode)
      } else if (teacher.teaching_modes && teacher.teaching_modes.length > 0) {
        setTeachingMode(teacher.teaching_modes[0])
      }
      if (defaultGrade) setGrade(defaultGrade)
      if (defaultSubject) setSubject(defaultSubject)
      if (defaultCity) setCity(defaultCity)
      if (isTraining && teacher.training_topics && teacher.training_topics.length > 0) {
        setTrainingTopic(teacher.training_topics[0])
      }
      setIsSuccess(false)
      setError('')
    }
  }, [teacher, initialPricing, defaultMode, defaultGrade, defaultSubject, defaultCity, isTraining])

  if (!isOpen || !teacher) return null

  const activePricing = pricingOptions.find(p => p.duration_minutes === selectedDuration) || pricingOptions[0]

  // Filter grades to those taught by this teacher (or all if none specified)
  const modalGrades = teacher?.grades && teacher.grades.length > 0
    ? grades.filter(g => teacher.grades?.some(tg => tg.includes(g.name) || g.name.includes(tg)))
    : grades

  // Filter subjects for the selected grade
  const availableSubjects = grade
    ? subjects.filter(s => {
        const matchingGrade = grades.find(g => g.name === grade)
        return matchingGrade ? s.grade_id === matchingGrade.id : true
      })
    : subjects

  const modalSubjects = teacher?.subjects && teacher.subjects.length > 0
    ? availableSubjects.filter(s => teacher.subjects?.some(ts => ts.includes(s.name) || s.name.includes(ts)))
    : availableSubjects

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!applicantName.trim()) {
      return setError(isTraining ? 'نام و نام خانوادگی متقاضی دوره الزامی است' : 'نام و نام خانوادگی دانش‌آموز الزامی است')
    }
    if (!phone.trim() || phone.trim().length < 10) {
      return setError('شماره تماس معتبر الزامی است')
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tutoring/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacher?.id,
          student_name: applicantName.trim(),
          phone: phone.trim(),
          teaching_mode: teachingMode,
          teaching_type: isTraining ? 'teacher_training' : 'student',
          grade: isTraining ? null : (grade || null),
          subject: isTraining ? (trainingTopic.trim() || null) : (subject || null),
          duration_minutes: selectedDuration || null,
          preferred_time: preferredTime.trim() || null,
          city: teachingMode === 'in_person' ? (city.trim() || null) : null,
          notes: notes.trim() || null
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'خطا در ثبت درخواست')
        setLoading(false)
        return
      }

      setIsSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError('خطا در برقراری ارتباط با سرور: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-6 text-white flex items-center justify-between border-b-2 ${
          isTraining
            ? 'bg-gradient-to-r from-purple-900 to-purple-700 border-purple-950'
            : 'bg-gradient-to-r from-teal-deep to-teal border-teal-700'
        }`}>
          <div className="flex items-center gap-3">
            {teacher.photo_url ? (
              <img
                src={teacher.photo_url}
                alt={teacher.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center font-black text-xl">
                {teacher.name.slice(0, 1)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{teacher.name}</h3>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-bold">
                  {isTraining ? 'دوره تربیت معلم' : 'تدریس خصوصی'}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                {isTraining ? 'ثبت‌نام و درخواست جلسه آموزش معلمان' : 'رزرو کلاس و هماهنگی جلسه'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-black text-slate-900">
                درخواست شما با موفقیت ثبت شد!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                اطلاعات شما برای {teacher.name} و تیم پشتیبانی یار اولی‌ها ارسال شد. کارشناسان ما جهت هماهنگی نهایی با شما تماس خواهند گرفت.
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs text-slate-700 w-full flex flex-col gap-2 text-right">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">متقاضی:</span>
                  <span className="font-black text-slate-900">{applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">نوع جلسه:</span>
                  <span className="font-black text-teal-800">
                    {teachingMode === 'online' ? 'آنلاین (تصویری)' : 'حضوری'}
                  </span>
                </div>
                {isTraining && trainingTopic && (
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">سرفصل:</span>
                    <span className="font-black text-purple-900">{trainingTopic}</span>
                  </div>
                )}
                {!isTraining && (grade || subject) && (
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">درس و پایه:</span>
                    <span className="font-black text-slate-900">
                      {[grade, subject].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-teal text-white rounded-xl font-black text-xs hover:bg-teal-deep transition-all shadow-md"
              >
                تایید و بازگشت
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

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  شیوه برگزاری جلسه *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTeachingMode('online')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all font-black flex items-center justify-center gap-1.5 ${
                      teachingMode === 'online'
                        ? 'bg-teal text-white border-teal-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>آنلاین (سراسر کشور)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeachingMode('in_person')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all font-black flex items-center justify-center gap-1.5 ${
                      teachingMode === 'in_person'
                        ? 'bg-teal text-white border-teal-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>حضوری (در شهر شما)</span>
                  </button>
                </div>
              </div>

              {/* In-Person City */}
              {teachingMode === 'in_person' && (
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    شهر یا منطقه شما برای تدریس حضوری *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="مثال: تهران (منطقه ۲) یا اصفهان"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    required
                  />
                </div>
              )}

              {/* Training Topic OR Grade & Subject */}
              {isTraining ? (
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    موضوع یا سرفصل دوره تربیت معلم *
                  </label>
                  {teacher.training_topics && teacher.training_topics.length > 0 ? (
                    <select
                      value={trainingTopic}
                      onChange={e => setTrainingTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:ring-3 focus:ring-purple-200 transition-all shadow-xs"
                    >
                      {teacher.training_topics.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                      <option value="سایر موضوعات">سایر موضوعات (در بخش توضیحات)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={trainingTopic}
                      onChange={e => setTrainingTopic(e.target.value)}
                      placeholder="مثال: روش تدریس ریاضی اول، مدیریت کلاس، یا..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-3 focus:ring-purple-200 transition-all shadow-xs"
                      required
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">پایه تحصیلی</label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal transition-all shadow-xs"
                    >
                      <option value="">انتخاب پایه...</option>
                      {modalGrades.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">درس مورد نظر</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal transition-all shadow-xs"
                    >
                      <option value="">انتخاب درس...</option>
                      {modalSubjects.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Pricing Duration Selection */}
              {pricingOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">
                    {isTraining ? 'پکیج یا مدت زمان جلسه' : 'مدت زمان جلسه'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {pricingOptions.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDuration(p.duration_minutes)}
                        className={`p-2.5 rounded-xl border-2 text-right transition-all flex flex-col gap-0.5 ${
                          selectedDuration === p.duration_minutes
                            ? (isTraining
                                ? 'bg-purple-50 text-purple-950 border-purple-700 shadow-xs'
                                : 'bg-teal/10 text-teal-950 border-teal shadow-xs')
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-xs font-black">
                          {p.title || `${p.duration_minutes} دقیقه`}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {Number(p.price_toman).toLocaleString('fa-IR')} تومان
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicant Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    {isTraining ? 'نام و نام خانوادگی همکار *' : 'نام و نام خانوادگی دانش‌آموز *'}
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    placeholder="مثال: علی احمدی"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    شماره تماس جهت هماهنگی *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  توضیحات و زمان‌های پیشنهادی (اختیاری)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="مثال: ترجیحاً روزهای پنجشنبه یا بعدازظهرها..."
                  className="w-full px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal transition-all shadow-xs resize-none"
                />
              </div>

              {/* Total Summary & Submit */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {activePricing && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-bold block">مبلغ جلسه:</span>
                      <span className="text-base font-black text-teal-800" dir="ltr">
                        {Number(activePricing.price_toman).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    انصراف
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2.5 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${
                      isTraining
                        ? 'bg-purple-700 hover:bg-purple-800'
                        : 'bg-teal hover:bg-teal-deep'
                    }`}
                  >
                    {loading ? (
                      <span>در حال ثبت...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isTraining ? 'ثبت‌نام در دوره' : 'ثبت درخواست کلاس'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
