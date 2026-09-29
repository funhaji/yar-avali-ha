'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X, Check, Star,
  Clock, DollarSign, Calendar, MapPin, Award, BookOpen, Layers, Video
} from 'lucide-react'
import { PricingOption, AvailabilitySchedule } from '@/lib/teachers'

interface Teacher {
  id: string
  name: string
  specialty: string | null
  bio: string | null
  photo_url: string | null
  video_url?: string | null
  display_order: number
  is_visible: boolean
  education?: string | null
  location?: string | null
  workplace?: string | null
  experience_years?: number | null
  national_rank?: number | null
  provincial_rank?: number | null
  district_rank?: number | null
  contact_phone?: string | null
  telegram_id?: string | null
  whatsapp_id?: string | null
  eitaa_id?: string | null
  instagram_id?: string | null
  teaching_modes?: string[] | null
  badge_text?: string | null
  star_rating?: number | null
  review_count?: number | null
  successful_sessions?: number | null
  highlights?: string[] | null
  pricing_options?: PricingOption[] | null
  availability_schedule?: AvailabilitySchedule | null
  grades?: string[] | null
  subjects?: string[] | null
  cities?: string[] | null
}

const emptyForm: Partial<Teacher> = {
  id: '',
  name: '',
  specialty: '',
  bio: '',
  photo_url: '',
  video_url: '',
  display_order: 0,
  is_visible: true,
  education: '',
  location: '',
  workplace: '',
  experience_years: undefined,
  national_rank: undefined,
  provincial_rank: undefined,
  district_rank: undefined,
  contact_phone: '',
  telegram_id: '',
  whatsapp_id: '',
  eitaa_id: '',
  instagram_id: '',
  teaching_modes: ['online', 'in_person'],
  badge_text: 'استاد تایید شده',
  star_rating: 5.0,
  review_count: 0,
  successful_sessions: 0,
  highlights: [],
  pricing_options: [
    { duration_minutes: 60, price_toman: 350000 },
    { duration_minutes: 90, price_toman: 500000 }
  ],
  availability_schedule: {
    days: ['شنبه', 'دوشنبه', 'چهارشنبه'],
    hours: '۱۶:۰۰ الی ۲۱:۰۰',
    notes: 'هماهنگی قبلی حداقل ۲۴ ساعت'
  },
  grades: [],
  subjects: [],
  cities: []
}

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

export function TeacherManager({ initial }: { initial: Teacher[] }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initial)
  const [form, setForm] = useState<Partial<Teacher>>(emptyForm)
  const [editing, setEditing] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'tutoring' | 'pricing' | 'taxonomies'>('basic')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Taxonomies loaded from DB for easy assignment
  const [availableGrades, setAvailableGrades] = useState<{ id: string; name: string }[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<{ id: string; name: string; grade_name?: string }[]>([])

  // Local state for dynamic inputs
  const [newHighlight, setNewHighlight] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newDuration, setNewDuration] = useState<number>(60)
  const [newPrice, setNewPrice] = useState<number>(300000)

  useEffect(() => {
    fetch('/api/admin/tutoring/taxonomies')
      .then(res => res.json())
      .then(d => {
        if (d.grades) setAvailableGrades(d.grades)
        if (d.subjects) setAvailableSubjects(d.subjects)
      })
      .catch(() => {})
  }, [])

  function reset() {
    setForm(emptyForm)
    setEditing(false)
    setError('')
    setActiveFormTab('basic')
  }

  function startEdit(t: Teacher) {
    setForm({
      ...t,
      specialty: t.specialty || '',
      bio: t.bio || '',
      photo_url: t.photo_url || '',
      video_url: t.video_url || '',
      education: t.education || '',
      location: t.location || '',
      workplace: t.workplace || '',
      teaching_modes: t.teaching_modes && t.teaching_modes.length > 0 ? t.teaching_modes : ['online', 'in_person'],
      badge_text: t.badge_text || '',
      star_rating: t.star_rating ?? 5.0,
      review_count: t.review_count ?? 0,
      successful_sessions: t.successful_sessions ?? 0,
      highlights: t.highlights || [],
      pricing_options: t.pricing_options && t.pricing_options.length > 0 ? t.pricing_options : [
        { duration_minutes: 60, price_toman: 350000 },
        { duration_minutes: 90, price_toman: 500000 }
      ],
      availability_schedule: t.availability_schedule || { days: [], hours: '', notes: '' },
      grades: t.grades || [],
      subjects: t.subjects || [],
      cities: t.cities || []
    })
    setEditing(true)
    setActiveFormTab('basic')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function upload(file: File) {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const d = await r.json()
    setUploading(false)
    if (!r.ok) return setError(d.error || 'خطا در آپلود عکس')
    setForm(f => ({ ...f, photo_url: d.url }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name?.trim()) return setError('نام استاد الزامی است')

    setSaving(true)
    setError('')
    const method = editing ? 'PUT' : 'POST'
    try {
      const r = await fetch('/api/admin/teachers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const d = await r.json()
      setSaving(false)
      if (!r.ok) return setError(d.error || 'خطا در ذخیره استاد')

      setTeachers(list => editing ? list.map(t => t.id === d.teacher.id ? d.teacher : t) : [d.teacher, ...list])
      reset()
    } catch {
      setSaving(false)
      setError('خطا در برقراری ارتباط با سرور')
    }
  }

  async function remove(id: string) {
    if (!confirm('آیا از حذف این استاد اطمینان دارید؟')) return
    await fetch('/api/admin/teachers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setTeachers(list => list.filter(t => t.id !== id))
  }

  async function toggle(t: Teacher) {
    const updated = { ...t, is_visible: !t.is_visible }
    const r = await fetch('/api/admin/teachers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    const d = await r.json()
    if (r.ok) setTeachers(list => list.map(x => x.id === d.teacher.id ? d.teacher : x))
  }

  // --- Dynamic highlight management ---
  function addHighlight() {
    if (!newHighlight.trim()) return
    setForm(f => ({
      ...f,
      highlights: [...(f.highlights || []), newHighlight.trim()]
    }))
    setNewHighlight('')
  }

  function removeHighlight(index: number) {
    setForm(f => ({
      ...f,
      highlights: (f.highlights || []).filter((_, i) => i !== index)
    }))
  }

  // --- Dynamic pricing management ---
  function addPricingOption() {
    if (!newDuration || !newPrice) return
    const options = form.pricing_options || []
    if (options.some(o => o.duration_minutes === Number(newDuration))) {
      alert('این مدت زمان قبلاً اضافه شده است')
      return
    }
    setForm(f => ({
      ...f,
      pricing_options: [...(f.pricing_options || []), { duration_minutes: Number(newDuration), price_toman: Number(newPrice) }]
    }))
  }

  function removePricingOption(index: number) {
    setForm(f => ({
      ...f,
      pricing_options: (f.pricing_options || []).filter((_, i) => i !== index)
    }))
  }

  // --- Days toggle ---
  function toggleDay(day: string) {
    const currentDays = form.availability_schedule?.days || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    setForm(f => ({
      ...f,
      availability_schedule: {
        ...(f.availability_schedule || {}),
        days: newDays
      }
    }))
  }

  // --- Mode toggle ---
  function toggleMode(mode: string) {
    const currentModes = form.teaching_modes || []
    const newModes = currentModes.includes(mode)
      ? currentModes.filter(m => m !== mode)
      : [...currentModes, mode]
    setForm(f => ({ ...f, teaching_modes: newModes }))
  }

  // --- Taxonomies check toggle ---
  function toggleGrade(gradeName: string) {
    const current = form.grades || []
    const updated = current.includes(gradeName)
      ? current.filter(g => g !== gradeName)
      : [...current, gradeName]
    setForm(f => ({ ...f, grades: updated }))
  }

  function toggleSubject(subjectName: string) {
    const current = form.subjects || []
    const updated = current.includes(subjectName)
      ? current.filter(s => s !== subjectName)
      : [...current, subjectName]
    setForm(f => ({ ...f, subjects: updated }))
  }

  // --- Cities management ---
  function addCity() {
    if (!newCity.trim()) return
    const trimmed = newCity.trim()
    if (!form.cities?.includes(trimmed)) {
      setForm(f => ({ ...f, cities: [...(f.cities || []), trimmed] }))
    }
    setNewCity('')
  }

  function removeCity(cityName: string) {
    setForm(f => ({ ...f, cities: (f.cities || []).filter(c => c !== cityName) }))
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Teacher Form Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal/15 text-teal-800 border-2 border-teal/40 flex items-center justify-center font-bold">
              {editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {editing ? `ویرایش اطلاعات استاد: ${form.name}` : 'افزودن استاد جدید'}
              </h2>
              <p className="text-xs text-slate-600 font-medium">اطلاعات فردی، تعرفه‌های زمانی و زمان‌بندی جلسات تدریس خصوصی</p>
            </div>
          </div>
          {editing && (
            <button
              onClick={reset}
              type="button"
              className="text-xs font-black text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              انصراف و افزودن جدید
            </button>
          )}
        </div>

        {/* Tab navigation inside form */}
        <div className="bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 flex items-center gap-2 mb-6 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveFormTab('basic')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFormTab === 'basic'
                ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            <span>اطلاعات فردی و رزومه</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('tutoring')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFormTab === 'tutoring'
                ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>نشان، سابقه و امتیاز</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('pricing')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFormTab === 'pricing'
                ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>قیمت‌گذاری و زمان‌بندی</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('taxonomies')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-2 ${
              activeFormTab === 'taxonomies'
                ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            <BookOpen className="w-4 h-4 text-tangerine" />
            <span>پایه‌ها، دروس و شهرها</span>
          </button>
        </div>

        <form onSubmit={save} className="flex flex-col gap-6">
          {/* TAB 1: BASIC INFO */}
          {activeFormTab === 'basic' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">نام استاد *</label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: مریم مهربان‌فر"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">تخصص / عنوان کوتاه</label>
                  <input
                    type="text"
                    value={form.specialty || ''}
                    onChange={e => setForm({ ...form, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: مدرس تخصصی اول دبستان"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">مدرک تحصیلی</label>
                  <input
                    type="text"
                    value={form.education || ''}
                    onChange={e => setForm({ ...form, education: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: کارشناسی ارشد آموزش ابتدایی"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">استان و شهر سکونت</label>
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: تهران"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">محل خدمت یا مدرسه</label>
                  <input
                    type="text"
                    value={form.workplace || ''}
                    onChange={e => setForm({ ...form, workplace: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: دبستان علامه طباطبایی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">سابقه کار (سال)</label>
                  <input
                    type="number"
                    value={form.experience_years ?? ''}
                    onChange={e => setForm({ ...form, experience_years: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: ۸"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">شماره تماس (ارتباط مستقیم)</label>
                  <input
                    type="text"
                    value={form.contact_phone || ''}
                    onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs text-left"
                    dir="ltr"
                    placeholder="0912..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">آیدی تلگرام</label>
                  <input
                    type="text"
                    value={form.telegram_id || ''}
                    onChange={e => setForm({ ...form, telegram_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs text-left"
                    dir="ltr"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">شماره یا آیدی واتساپ</label>
                  <input
                    type="text"
                    value={form.whatsapp_id || ''}
                    onChange={e => setForm({ ...form, whatsapp_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs text-left"
                    dir="ltr"
                    placeholder="0912... یا لینک"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">آیدی ایتا</label>
                  <input
                    type="text"
                    value={form.eitaa_id || ''}
                    onChange={e => setForm({ ...form, eitaa_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs text-left"
                    dir="ltr"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">لینک ویدیوی معرفی (آپارات یا مستقیم)</label>
                  <input
                    type="url"
                    value={form.video_url || ''}
                    onChange={e => setForm({ ...form, video_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs text-left"
                    dir="ltr"
                    placeholder="https://www.aparat.com/v/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">بیوگرافی و توضیحات تکمیلی</label>
                <textarea
                  rows={3}
                  value={form.bio || ''}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs leading-relaxed"
                  placeholder="توضیحات معرفی استاد جهت نمایش در رزومه..."
                />
              </div>

              {/* Photo Upload */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex items-center justify-between flex-wrap gap-4 shadow-xs">
                <div className="flex items-center gap-4">
                  {form.photo_url ? (
                    <img
                      src={form.photo_url}
                      alt="عکس استاد"
                      className="w-16 h-16 rounded-full object-cover border-3 border-teal shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-500 font-bold">
                      <ImagePlus className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <span className="block font-black text-xs text-slate-900">تصویر پرتره استاد</span>
                    <span className="text-xs text-slate-500 font-medium">فرمت JPG یا PNG، با نسبت مربعی</span>
                  </div>
                </div>

                <label className="cursor-pointer px-4 py-2 text-xs font-black bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 hover:border-slate-400 rounded-xl shadow-xs transition-all">
                  {uploading ? 'در حال آپلود...' : 'انتخاب عکس جدید'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
                    disabled={uploading}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-black text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.is_visible ?? true}
                    onChange={e => setForm({ ...form, is_visible: e.target.checked })}
                    className="rounded border-2 border-slate-400 text-teal focus:ring-teal w-5 h-5 cursor-pointer"
                  />
                  <span>نمایش در سایت و صفحه اساتید</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 font-black">ترتیب نمایش:</span>
                  <input
                    type="number"
                    value={form.display_order ?? 0}
                    onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-20 px-3 py-1.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-center font-black shadow-xs focus:border-teal focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TUTORING ATTRIBUTES & HIGHLIGHTS */}
          {activeFormTab === 'tutoring' && (
            <div className="flex flex-col gap-6">
              {/* Teaching Modes */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 shadow-xs">
                <span className="block text-xs font-black text-slate-900 mb-3">شیوه‌های تدریس مجاز *</span>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 bg-white px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-teal transition-all shadow-xs">
                    <input
                      type="checkbox"
                      checked={form.teaching_modes?.includes('online') ?? false}
                      onChange={() => toggleMode('online')}
                      className="rounded border-2 border-slate-400 text-teal focus:ring-teal w-4 h-4 cursor-pointer"
                    />
                    <span>تدریس آنلاین (تصویری)</span>
                  </label>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 bg-white px-4 py-3 rounded-xl border-2 border-slate-300 hover:border-tangerine transition-all shadow-xs">
                    <input
                      type="checkbox"
                      checked={form.teaching_modes?.includes('in_person') ?? false}
                      onChange={() => toggleMode('in_person')}
                      className="rounded border-2 border-slate-400 text-tangerine focus:ring-tangerine w-4 h-4 cursor-pointer"
                    />
                    <span>تدریس حضوری</span>
                  </label>
                </div>
              </div>

              {/* Badges & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">متن نشان ویژه استاد</label>
                  <input
                    type="text"
                    value={form.badge_text || ''}
                    onChange={e => setForm({ ...form, badge_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: استاد تایید شده"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">امتیاز استاد (از ۵)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.star_rating ?? 5.0}
                    onChange={e => setForm({ ...form, star_rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-black text-center focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">تعداد نظرات ثبت‌شده</label>
                  <input
                    type="number"
                    min="0"
                    value={form.review_count ?? 0}
                    onChange={e => setForm({ ...form, review_count: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-center focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">جلسات موفق برگزار شده</label>
                  <input
                    type="number"
                    min="0"
                    value={form.successful_sessions ?? 0}
                    onChange={e => setForm({ ...form, successful_sessions: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-center focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                    placeholder="مثال: ۸۲۰"
                  />
                </div>
              </div>

              {/* Bullet highlights */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">سوابق کلیدی و نکات برجسته (بولِت‌پوینت‌ها)</span>
                  <span className="text-xs text-slate-500 font-medium">در کارت و مودال رزومه نمایش داده می‌شود</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={e => setNewHighlight(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
                    placeholder="مثال: سابقه ۱۰ سال تدریس در مدارس غیر انتفاعی"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="px-5 py-2.5 text-xs font-black text-white bg-teal hover:bg-teal-deep border-2 border-teal-700 rounded-xl transition-all shadow-xs whitespace-nowrap"
                  >
                    افزودن سابقه
                  </button>
                </div>

                {form.highlights && form.highlights.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {form.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-slate-300 text-xs shadow-xs">
                        <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                          <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0"></span>
                          <span>{h}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHighlight(i)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & SCHEDULE */}
          {activeFormTab === 'pricing' && (
            <div className="flex flex-col gap-6">
              {/* Pricing options list */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex flex-col gap-4 shadow-xs">
                <div>
                  <h3 className="text-xs font-black text-slate-900">تعرفه‌های جلسه بر اساس مدت زمان</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">افزودن گزینه‌های ۳۰، ۶۰ یا ۹۰ دقیقه</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-white p-4 rounded-xl border-2 border-slate-300 shadow-xs">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">مدت زمان جلسه</label>
                    <select
                      value={newDuration}
                      onChange={e => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-teal"
                    >
                      <option value={30}>۳۰ دقیقه</option>
                      <option value={45}>۴۵ دقیقه</option>
                      <option value={60}>۶۰ دقیقه (۱ ساعت)</option>
                      <option value={90}>۹۰ دقیقه (۱.۵ ساعت)</option>
                      <option value={120}>۱۲۰ دقیقه (۲ ساعت)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">مبلغ به تومان</label>
                    <input
                      type="number"
                      step="10000"
                      value={newPrice}
                      onChange={e => setNewPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-teal"
                      placeholder="۳۵۰۰۰۰"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={addPricingOption}
                      className="w-full py-2.5 text-xs font-black text-white bg-teal hover:bg-teal-deep border-2 border-teal-700 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن به تعرفه‌ها</span>
                    </button>
                  </div>
                </div>

                {form.pricing_options && form.pricing_options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {form.pricing_options.map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-teal/40 shadow-xs"
                      >
                        <div>
                          <div className="font-black text-slate-900 text-sm">{opt.duration_minutes} دقیقه</div>
                          <div className="text-teal-700 font-black text-base mt-1" dir="ltr">
                            {Number(opt.price_toman).toLocaleString('fa-IR')} تومان
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePricingOption(i)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف تعرفه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-amber-900 bg-amber-50 p-4 rounded-xl border-2 border-amber-300 font-bold">
                    هیچ تعرفه‌ای برای این استاد ثبت نشده است. توصیه می‌شود حداقل یک گزینه مدت زمان و قیمت اضافه کنید.
                  </div>
                )}
              </div>

              {/* Availability schedule */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tangerine" />
                  <h3 className="text-xs font-black text-slate-900">برنامه زمان‌بندی و ساعات در دسترس بودن استاد</h3>
                </div>

                <div>
                  <span className="block text-xs font-black text-slate-700 mb-2.5">روزهای کاری در هفته:</span>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => {
                      const selected = form.availability_schedule?.days?.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 ${
                            selected
                              ? 'bg-tangerine text-white border-tangerine-deep font-black shadow-xs'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">بازه ساعات کاری</label>
                    <input
                      type="text"
                      value={form.availability_schedule?.hours || ''}
                      onChange={e => setForm({
                        ...form,
                        availability_schedule: { ...(form.availability_schedule || {}), hours: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-tangerine shadow-xs"
                      placeholder="مثال: ۱۶:۰۰ الی ۲۱:۰۰"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">توضیحات و شرایط هماهنگی</label>
                    <input
                      type="text"
                      value={form.availability_schedule?.notes || ''}
                      onChange={e => setForm({
                        ...form,
                        availability_schedule: { ...(form.availability_schedule || {}), notes: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-tangerine shadow-xs"
                      placeholder="مثال: هماهنگی قبلی حداقل ۲۴ ساعت قبل از جلسه"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TAXONOMIES (GRADES, SUBJECTS, CITIES) */}
          {activeFormTab === 'taxonomies' && (
            <div className="flex flex-col gap-6">
              {/* Grades Multi-select */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal" />
                    <span className="text-xs font-black text-slate-900">پایه‌های تحصیلی تحت تدریس این استاد</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">استاد در فیلتر این پایه‌ها نشان داده می‌شود</span>
                </div>

                {availableGrades.length === 0 ? (
                  <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 font-medium">
                    هنوز پایه‌ای در سیستم تعریف نشده است. لطفاً از تب "پایه‌ها و دروس" پایه‌های تحصیلی را اضافه کنید.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableGrades.map(g => {
                      const selected = form.grades?.includes(g.name)
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGrade(g.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 border-2 ${
                            selected
                              ? 'bg-teal text-white border-teal-700 font-black shadow-xs'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-teal font-bold shadow-xs'
                          }`}
                        >
                          {selected ? <Check className="w-4 h-4" /> : null}
                          <span>{g.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Subjects Multi-select */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-tangerine" />
                    <span className="text-xs font-black text-slate-900">دروس و مباحث تحت تدریس این استاد</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">استاد در فیلتر این دروس نشان داده می‌شود</span>
                </div>

                {availableSubjects.length === 0 ? (
                  <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 font-medium">
                    هنوز درسی در سیستم تعریف نشده است. لطفاً از تب "پایه‌ها و دروس" دروس را اضافه کنید.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableSubjects.map(s => {
                      const selected = form.subjects?.includes(s.name)
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSubject(s.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 border-2 ${
                            selected
                              ? 'bg-tangerine text-white border-tangerine-deep font-black shadow-xs'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-tangerine font-bold shadow-xs'
                          }`}
                        >
                          {selected ? <Check className="w-4 h-4" /> : null}
                          <span>{s.name}</span>
                          {s.grade_name && <span className="opacity-80 text-[11px]">({s.grade_name})</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Cities for In-person */}
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-300 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-black text-slate-900">شهرهای تحت پوشش تدریس حضوری</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">برای فیلتر تدریس حضوری</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
                    placeholder="نام شهر (مثال: تهران، کرج، مشهد...)"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-rose-400 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={addCity}
                    className="px-5 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 border-2 border-rose-800 rounded-xl transition-all shadow-xs whitespace-nowrap"
                  >
                    افزودن شهر
                  </button>
                </div>

                {form.cities && form.cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.cities.map(c => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-rose-300 rounded-xl text-xs font-bold text-rose-800 shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => removeCity(c)}
                          className="hover:text-rose-950 transition-colors ml-1 p-0.5 rounded hover:bg-rose-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-5 border-t-2 border-slate-200">
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="px-5 py-2.5 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 rounded-xl transition-all shadow-xs"
              >
                انصراف
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-black text-white bg-teal hover:bg-teal-deep border-2 border-teal-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'در حال ذخیره‌سازی...' : editing ? 'ذخیره تغییرات استاد' : 'ثبت استاد'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Teachers Directory List */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">
            اساتید و معلمان ثبت‌شده ({teachers.length})
          </h2>
          <span className="text-xs text-slate-600 font-bold">پیش‌نمایش کارت‌های اساتید در صفحه عمومی</span>
        </div>

        {teachers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-300 shadow-sm text-slate-600 font-medium">
            هنوز استادی اضافه نشده است. از فرم بالا اولین استاد را ثبت کنید.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map(t => (
              <article
                key={t.id}
                className={`bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between ${
                  !t.is_visible ? 'opacity-60 bg-slate-100/70 border-dashed' : ''
                }`}
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-teal/15 border-2 border-teal/40 text-teal-800 flex items-center justify-center font-bold">
                        <ImagePlus className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-slate-900 text-sm truncate">{t.name}</h3>
                        {t.badge_text && (
                          <span className="px-2.5 py-0.5 bg-teal/10 text-teal-800 border border-teal/30 font-black text-[11px] rounded-lg">
                            {t.badge_text}
                          </span>
                        )}
                      </div>
                      {t.specialty && (
                        <p className="text-xs text-slate-600 font-medium line-clamp-1">{t.specialty}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-black">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{t.star_rating || 5.0}</span>
                        </div>
                        {t.successful_sessions ? (
                          <span className="text-xs text-slate-500 font-medium">
                            • {t.successful_sessions} جلسه
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Teaching modes & pricing tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
                    {t.teaching_modes?.includes('online') && (
                      <span className="px-2.5 py-1 rounded-lg bg-teal/10 text-teal-800 border border-teal/30 font-bold">
                        آنلاین
                      </span>
                    )}
                    {t.teaching_modes?.includes('in_person') && (
                      <span className="px-2.5 py-1 rounded-lg bg-tangerine/10 text-tangerine-800 border border-tangerine/30 font-bold">
                        حضوری
                      </span>
                    )}
                    {t.pricing_options && t.pricing_options.length > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 font-black" dir="ltr">
                        از {Number(t.pricing_options[0].price_toman).toLocaleString('fa-IR')} ت
                      </span>
                    )}
                  </div>

                  {/* Grades and subjects summary */}
                  {(t.grades?.length || t.subjects?.length) ? (
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border-2 border-slate-200 flex flex-col gap-1 mb-4">
                      {t.grades && t.grades.length > 0 && (
                        <div className="line-clamp-1">
                          <span className="font-black text-slate-900">پایه‌ها: </span>
                          <span>{t.grades.join('، ')}</span>
                        </div>
                      )}
                      {t.subjects && t.subjects.length > 0 && (
                        <div className="line-clamp-1">
                          <span className="font-black text-slate-900">دروس: </span>
                          <span>{t.subjects.join('، ')}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
                  <span className="text-xs text-slate-500 font-bold">ترتیب: {t.display_order}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="p-2 text-slate-700 hover:text-teal hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs"
                      title="ویرایش"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(t)}
                      className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs"
                      title={t.is_visible ? 'مخفی کردن' : 'نمایش دادن'}
                    >
                      {t.is_visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-300 rounded-xl transition-all shadow-xs"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
