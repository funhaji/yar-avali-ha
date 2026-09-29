'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X, Check, Star,
  Clock, DollarSign, Calendar, MapPin, Award, BookOpen, Layers, Video,
  AlertCircle, ChevronLeft, ChevronRight, RotateCcw, Users, GraduationCap,
  MessageCircle, CheckCircle2, ShieldCheck, Sparkles, Filter, Search
} from 'lucide-react'
import {
  Teacher, PricingOption, AvailabilitySchedule,
  TeachingScope, TeacherReview
} from '@/lib/teachers'

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
    { duration_minutes: 60, price_toman: 350000, title: 'جلسه عادی' },
    { duration_minutes: 90, price_toman: 500000, title: 'جلسه جامع' }
  ],
  availability_schedule: {
    days: ['شنبه', 'دوشنبه', 'چهارشنبه'],
    hours: '۱۶:۰۰ الی ۲۱:۰۰',
    notes: 'هماهنگی قبلی حداقل ۲۴ ساعت'
  },
  grades: [],
  subjects: [],
  cities: [],
  // Teacher Training fields
  teaching_scope: 'students',
  training_topics: [],
  training_target_levels: ['معلمان بدو خدمت', 'معلمان پایه اول تا سوم'],
  training_bio: '',
  training_certificate: 'گواهی پایان دوره تخصصی روش تدریس',
  training_video_url: '',
  training_pricing_options: [
    { duration_minutes: 60, price_toman: 450000, title: 'جلسه مشاوره و منتورینگ' },
    { duration_minutes: 180, price_toman: 1200000, title: 'کارگاه عملی تخصصی' }
  ]
}

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

const COMMON_TRAINING_TOPICS = [
  'روش تدریس نوین ریاضی دبستان',
  'آموزش خلاق فارسی و نشانه‌ها',
  'مدیریت رفتار و نظم کلاس درس',
  'بازی‌وارسازی در آموزش (Gamification)',
  'تشخیص و درمان اختلالات یادگیری',
  'طراحی کاربرگ و آزمون‌های عملکردی',
  'کوچینگ و ارتقای مهارت نومعلمان'
]

export function TeacherManager({ initial }: { initial: Teacher[] }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initial)
  const [managerTab, setManagerTab] = useState<'teachers' | 'reviews'>('teachers')

  // Form states
  const [form, setForm] = useState<Partial<Teacher>>(emptyForm)
  const [editing, setEditing] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'tutoring' | 'student_pricing' | 'teacher_training'>('basic')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Taxonomies loaded from DB for easy assignment
  const [availableGrades, setAvailableGrades] = useState<{ id: string; name: string }[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<{ id: string; name: string; grade_id?: string; grade_name?: string }[]>([])

  // Local state for dynamic inputs
  const [newHighlight, setNewHighlight] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newDuration, setNewDuration] = useState<number>(60)
  const [newPrice, setNewPrice] = useState<number>(350000)
  const [newPricingTitle, setNewPricingTitle] = useState('')

  // Teacher training dynamic inputs
  const [newTrainingTopic, setNewTrainingTopic] = useState('')
  const [newTrainingLevel, setNewTrainingLevel] = useState('')
  const [newTrainingDuration, setNewTrainingDuration] = useState<number>(60)
  const [newTrainingPrice, setNewTrainingPrice] = useState<number>(450000)
  const [newTrainingTitle, setNewTrainingTitle] = useState('')

  // Reviews states
  const [reviews, setReviews] = useState<TeacherReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [reviewRoleFilter, setReviewRoleFilter] = useState<'all' | 'parent' | 'teacher'>('all')
  const [reviewTeacherFilter, setReviewTeacherFilter] = useState<string>('all')

  function loadTaxonomies() {
    fetch('/api/admin/tutoring/taxonomies')
      .then(res => res.json())
      .then(d => {
        if (d.grades) setAvailableGrades(d.grades)
        if (d.subjects) setAvailableSubjects(d.subjects)
      })
      .catch(() => {})
  }

  function loadReviews() {
    setReviewsLoading(true)
    fetch('/api/admin/teachers/reviews')
      .then(res => res.json())
      .then(d => {
        if (d.reviews) setReviews(d.reviews)
        setReviewsLoading(false)
      })
      .catch(() => setReviewsLoading(false))
  }

  useEffect(() => {
    loadTaxonomies()
    loadReviews()
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
        { duration_minutes: 60, price_toman: 350000, title: 'جلسه عادی' },
        { duration_minutes: 90, price_toman: 500000, title: 'جلسه جامع' }
      ],
      availability_schedule: t.availability_schedule || { days: [], hours: '', notes: '' },
      grades: t.grades || [],
      subjects: t.subjects || [],
      cities: t.cities || [],
      teaching_scope: t.teaching_scope || 'students',
      training_topics: t.training_topics || [],
      training_target_levels: t.training_target_levels || ['معلمان بدو خدمت', 'معلمان پایه اول تا سوم'],
      training_bio: t.training_bio || '',
      training_certificate: t.training_certificate || '',
      training_video_url: t.training_video_url || '',
      training_pricing_options: t.training_pricing_options && t.training_pricing_options.length > 0 ? t.training_pricing_options : [
        { duration_minutes: 60, price_toman: 450000, title: 'جلسه مشاوره و منتورینگ' }
      ]
    })
    setEditing(true)
    setError('')
    setActiveFormTab('basic')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'آپلود با خطا مواجه شد')
      setForm(f => ({ ...f, photo_url: data.url }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name?.trim()) {
      setError('نام استاد الزامی است')
      return
    }

    setSaving(true)
    setError('')
    setSuccessMsg('')

    try {
      const url = '/api/admin/teachers'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'خطا در ذخیره‌سازی')
      }

      if (editing) {
        setTeachers(list => list.map(t => t.id === data.teacher.id ? data.teacher : t))
        setSuccessMsg('اطلاعات استاد با موفقیت به‌روزرسانی شد.')
      } else {
        setTeachers(list => [data.teacher, ...list])
        setSuccessMsg('استاد جدید با موفقیت اضافه شد.')
      }
      reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('آیا از حذف این استاد اطمینان دارید؟ تمامی درخواست‌ها و نظرات این استاد نیز حذف خواهند شد.')) return
    await fetch('/api/admin/teachers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setTeachers(list => list.filter(t => t.id !== id))
    setReviews(list => list.filter(r => r.teacher_id !== id))
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

  // --- Student Pricing management ---
  function addPricingOption() {
    if (!newDuration || !newPrice) return
    setForm(f => ({
      ...f,
      pricing_options: [
        ...(f.pricing_options || []),
        {
          duration_minutes: Number(newDuration),
          price_toman: Number(newPrice),
          title: newPricingTitle.trim() || undefined
        }
      ]
    }))
    setNewPricingTitle('')
  }

  function removePricingOption(index: number) {
    setForm(f => ({
      ...f,
      pricing_options: (f.pricing_options || []).filter((_, i) => i !== index)
    }))
  }

  // --- Teacher Training Pricing management ---
  function addTrainingPricingOption() {
    if (!newTrainingDuration || !newTrainingPrice) return
    setForm(f => ({
      ...f,
      training_pricing_options: [
        ...(f.training_pricing_options || []),
        {
          duration_minutes: Number(newTrainingDuration),
          price_toman: Number(newTrainingPrice),
          title: newTrainingTitle.trim() || `جلسه ${newTrainingDuration} دقیقه‌ای`
        }
      ]
    }))
    setNewTrainingTitle('')
  }

  function removeTrainingPricingOption(index: number) {
    setForm(f => ({
      ...f,
      training_pricing_options: (f.training_pricing_options || []).filter((_, i) => i !== index)
    }))
  }

  // --- Training topics management ---
  function addTrainingTopic(topicName?: string) {
    const val = topicName || newTrainingTopic.trim()
    if (!val) return
    const current = form.training_topics || []
    if (current.includes(val)) return
    setForm(f => ({
      ...f,
      training_topics: [...current, val]
    }))
    if (!topicName) setNewTrainingTopic('')
  }

  function removeTrainingTopic(index: number) {
    setForm(f => ({
      ...f,
      training_topics: (f.training_topics || []).filter((_, i) => i !== index)
    }))
  }

  // --- Training target levels management ---
  function addTrainingLevel() {
    if (!newTrainingLevel.trim()) return
    const current = form.training_target_levels || []
    if (current.includes(newTrainingLevel.trim())) return
    setForm(f => ({
      ...f,
      training_target_levels: [...current, newTrainingLevel.trim()]
    }))
    setNewTrainingLevel('')
  }

  function removeTrainingLevel(index: number) {
    setForm(f => ({
      ...f,
      training_target_levels: (f.training_target_levels || []).filter((_, i) => i !== index)
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

  function toggleCategoryGrades(categoryName: string, selectAll: boolean) {
    const catGrades = availableGrades.filter(g => (g.category || 'دوره ابتدایی') === categoryName).map(g => g.name)
    const current = new Set(form.grades || [])
    if (selectAll) {
      catGrades.forEach(g => current.add(g))
    } else {
      catGrades.forEach(g => current.delete(g))
    }
    setForm(f => ({ ...f, grades: Array.from(current) }))
  }

  function selectAllGradeSubjects(gradeId: string, gradeName: string) {
    const gradeSubjects = availableSubjects.filter(s => s.grade_id === gradeId).map(s => s.name)
    const currentGrades = form.grades || []
    const newGrades = currentGrades.includes(gradeName) ? currentGrades : [...currentGrades, gradeName]
    const currentSubjects = new Set(form.subjects || [])
    gradeSubjects.forEach(s => currentSubjects.add(s))
    setForm(f => ({
      ...f,
      grades: newGrades,
      subjects: Array.from(currentSubjects)
    }))
  }

  function toggleSubject(subjectName: string, gradeName?: string) {
    const current = form.subjects || []
    const updated = current.includes(subjectName)
      ? current.filter(s => s !== subjectName)
      : [...current, subjectName]

    let updatedGrades = form.grades || []
    if (gradeName && !current.includes(subjectName) && !updatedGrades.includes(gradeName)) {
      updatedGrades = [...updatedGrades, gradeName]
    }
    setForm(f => ({ ...f, subjects: updated, grades: updatedGrades }))
  }

  function addCity() {
    if (!newCity.trim()) return
    const current = form.cities || []
    if (current.includes(newCity.trim())) return
    setForm(f => ({ ...f, cities: [...current, newCity.trim()] }))
    setNewCity('')
  }

  function removeCity(index: number) {
    setForm(f => ({ ...f, cities: (f.cities || []).filter((_, i) => i !== index) }))
  }

  // --- Reviews Moderation Handlers ---
  async function handleToggleReviewApproval(review: TeacherReview) {
    const targetStatus = !review.is_approved
    try {
      const res = await fetch('/api/admin/teachers/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: review.id, is_approved: targetStatus })
      })
      if (res.ok) {
        setReviews(list => list.map(r => r.id === review.id ? { ...r, is_approved: targetStatus } : r))
        // Reload teachers to get updated rating
        fetch('/api/admin/teachers')
          .then(r => r.json())
          .then(d => { if (d.teachers) setTeachers(d.teachers) })
      }
    } catch {}
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return
    try {
      const res = await fetch('/api/admin/teachers/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId })
      })
      if (res.ok) {
        setReviews(list => list.filter(r => r.id !== reviewId))
        fetch('/api/admin/teachers')
          .then(r => r.json())
          .then(d => { if (d.teachers) setTeachers(d.teachers) })
      }
    } catch {}
  }

  const pendingReviewsCount = reviews.filter(r => !r.is_approved).length

  // Filtered reviews in admin
  const adminFilteredReviews = reviews.filter(r => {
    if (reviewStatusFilter === 'pending' && r.is_approved) return false
    if (reviewStatusFilter === 'approved' && !r.is_approved) return false
    if (reviewRoleFilter !== 'all' && r.reviewer_role !== reviewRoleFilter) return false
    if (reviewTeacherFilter !== 'all' && r.teacher_id !== reviewTeacherFilter) return false
    return true
  })

  const currentScope = form.teaching_scope || 'students'
  const allowsStudents = currentScope === 'students' || currentScope === 'both'
  const allowsTeachers = currentScope === 'teachers' || currentScope === 'both'

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-slate-800 w-full max-w-full">
      {/* Master Tab Bar: Teachers vs Reviews */}
      <div className="bg-slate-200/90 p-1.5 sm:p-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-2 border-slate-300 shadow-sm w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scroll-smooth">
          <button
            type="button"
            onClick={() => setManagerTab('teachers')}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 border-2 whitespace-nowrap shrink-0 ${
              managerTab === 'teachers'
                ? 'bg-teal text-white border-teal-700 shadow-md font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>مدیریت اساتید ({teachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setManagerTab('reviews')}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 border-2 whitespace-nowrap shrink-0 ${
              managerTab === 'reviews'
                ? 'bg-amber-600 text-white border-amber-800 shadow-md font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>نظرات و امتیازات ({reviews.length})</span>
            {pendingReviewsCount > 0 && (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] sm:text-xs font-black animate-pulse">
                {pendingReviewsCount} جدید
              </span>
            )}
          </button>
        </div>

        {managerTab === 'teachers' && (
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن استاد جدید</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: TEACHERS MANAGER */}
      {/* ============================================================== */}
      {managerTab === 'teachers' && (
        <>
          {/* Create / Edit Form Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-slate-300 shadow-md w-full max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4 sm:pb-5 mb-5 sm:mb-6">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-teal/15 text-teal-800 border-2 border-teal/40 flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
                  {editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {editing ? `ویرایش اطلاعات استاد: ${form.name}` : 'افزودن استاد جدید'}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                    اطلاعات فردی، تعیین دامنه تدریس (دانش‌آموزان / معلمان)، تعرفه‌ها و سوابق
                  </p>
                </div>
              </div>
              {editing && (
                <button
                  onClick={reset}
                  type="button"
                  className="self-start sm:self-auto text-xs font-black text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                >
                  انصراف و فرم جدید
                </button>
              )}
            </div>

            {/* Teaching Scope Selector Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-300 mb-6">
              <label className="block text-xs font-black text-slate-900 mb-2">
                مخاطبان هدف و دامنه تدریس این استاد *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, teaching_scope: 'students' })}
                  className={`p-3.5 rounded-xl border-2 text-right transition-all flex flex-col gap-1 ${
                    currentScope === 'students'
                      ? 'bg-teal text-white border-teal-700 shadow-md font-black'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">تدریس به دانش‌آموزان</span>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] opacity-80 font-normal">معلم خصوصی مقطع دبستان (پایه اول تا سوم)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, teaching_scope: 'teachers' })}
                  className={`p-3.5 rounded-xl border-2 text-right transition-all flex flex-col gap-1 ${
                    currentScope === 'teachers'
                      ? 'bg-purple-700 text-white border-purple-900 shadow-md font-black'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">تربیت معلم (تدریس به همکاران)</span>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] opacity-80 font-normal">آموزش روش‌های نوین تدریس به معلمان</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, teaching_scope: 'both' })}
                  className={`p-3.5 rounded-xl border-2 text-right transition-all flex flex-col gap-1 ${
                    currentScope === 'both'
                      ? 'bg-slate-900 text-white border-slate-950 shadow-md font-black'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">هر دو مورد (دانش‌آموزان + معلمان)</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-[11px] opacity-80 font-normal">امکان تنظیم تعرفه و سرفصل مجزا برای هر دو گروه</span>
                </button>
              </div>
            </div>

            {/* Tab navigation inside form */}
            <div className="bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6 overflow-x-auto scroll-smooth w-full max-w-full text-xs">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border-2 ${
                  activeFormTab === 'basic'
                    ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                }`}
              >
                <span>۱. اطلاعات فردی و شناسنامه</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('tutoring')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border-2 ${
                  activeFormTab === 'tutoring'
                    ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                }`}
              >
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>۲. نشان‌ها و افتخارات</span>
              </button>

              {/* Student Tutoring Tab (shown if students or both) */}
              {allowsStudents && (
                <button
                  type="button"
                  onClick={() => setActiveFormTab('student_pricing')}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 border-2 ${
                    activeFormTab === 'student_pricing'
                      ? 'bg-teal text-white border-teal-700 shadow-sm font-black'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-teal shrink-0" />
                  <span>۳. پایه‌ها، دروس و تعرفه دانش‌آموزان</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] bg-teal/10 text-teal-800 font-black">
                    {form.grades?.length || 0} پایه
                  </span>
                </button>
              )}

              {/* Teacher Training Tab (shown if teachers or both) */}
              {allowsTeachers && (
                <button
                  type="button"
                  onClick={() => setActiveFormTab('teacher_training')}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 border-2 ${
                    activeFormTab === 'teacher_training'
                      ? 'bg-purple-700 text-white border-purple-900 shadow-sm font-black'
                      : 'bg-white text-purple-950 border-purple-300 hover:border-purple-400 font-bold shadow-xs'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>۴. تنظیمات و تعرفه تربیت معلم</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] bg-purple-100 text-purple-900 font-black">
                    {form.training_topics?.length || 0} سرفصل
                  </span>
                </button>
              )}
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
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: مریم مهربان‌فر"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">عنوان تخصص یا عنوان اصلی</label>
                      <input
                        type="text"
                        value={form.specialty || ''}
                        onChange={e => setForm({ ...form, specialty: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: مدرس تخصصی ریاضی اول و دوم دبستان"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">ترتیب نمایش در سایت</label>
                      <input
                        type="number"
                        value={form.display_order ?? 0}
                        onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1.5">بیوگرافی و معرفی عمومی استاد</label>
                    <textarea
                      value={form.bio || ''}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs resize-none"
                      placeholder="خلاصه‌ای از شیوه تدریس، مدارک و تجربیات آموزشی..."
                    />
                  </div>

                  {/* Photo & Video */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">تصویر پرتره استاد</label>
                      <div className="flex items-center gap-3">
                        {form.photo_url && (
                          <img
                            src={form.photo_url}
                            alt="preview"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 shadow-xs"
                          />
                        )}
                        <label className="flex-1 cursor-pointer py-2.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-teal transition-all">
                          <ImagePlus className="w-4 h-4 text-teal" />
                          <span>{uploading ? 'در حال آپلود...' : 'انتخاب یا تغییر عکس'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">لینک ویدیوی آپارات یا مستقیم</label>
                      <input
                        type="url"
                        value={form.video_url || ''}
                        onChange={e => setForm({ ...form, video_url: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                        placeholder="https://www.aparat.com/v/..."
                      />
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">شماره تماس استاد</label>
                      <input
                        type="tel"
                        value={form.contact_phone || ''}
                        onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">آیدی تلگرام</label>
                      <input
                        type="text"
                        value={form.telegram_id || ''}
                        onChange={e => setForm({ ...form, telegram_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                        placeholder="@username"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">شماره یا لینک واتساپ</label>
                      <input
                        type="text"
                        value={form.whatsapp_id || ''}
                        onChange={e => setForm({ ...form, whatsapp_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AWARDS & HIGHLIGHTS */}
              {activeFormTab === 'tutoring' && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">مدرک تحصیلی</label>
                      <input
                        type="text"
                        value={form.education || ''}
                        onChange={e => setForm({ ...form, education: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: کارشناسی ارشد آموزش ابتدایی"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">شهر یا استان سکونت</label>
                      <input
                        type="text"
                        value={form.location || ''}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: تهران یا اصفهان"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">سابقه تدریس (سال)</label>
                      <input
                        type="number"
                        value={form.experience_years ?? ''}
                        onChange={e => setForm({ ...form, experience_years: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: ۸"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">تعداد جلسات موفق</label>
                      <input
                        type="number"
                        value={form.successful_sessions ?? 0}
                        onChange={e => setForm({ ...form, successful_sessions: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">رتبه کشوری (اختیاری)</label>
                      <input
                        type="number"
                        value={form.national_rank ?? ''}
                        onChange={e => setForm({ ...form, national_rank: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: ۱"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">رتبه استانی (اختیاری)</label>
                      <input
                        type="number"
                        value={form.provincial_rank ?? ''}
                        onChange={e => setForm({ ...form, provincial_rank: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: ۳"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">عنوان نشان / نشان اعتماد</label>
                      <input
                        type="text"
                        value={form.badge_text || ''}
                        onChange={e => setForm({ ...form, badge_text: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-teal shadow-xs"
                        placeholder="مثال: استاد برتر کشوری"
                      />
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-2">نکات برجسته و افتخارات استاد (نمایش در کارت)</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={e => setNewHighlight(e.target.value)}
                        placeholder="مثال: مولف ۳ جلد کتاب کمک‌آموزشی ریاضی دبستان"
                        className="flex-1 px-3.5 py-2 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={addHighlight}
                        className="px-4 py-2 bg-teal text-white rounded-xl text-xs font-black hover:bg-teal-deep transition-all shadow-xs"
                      >
                        افزودن
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {form.highlights?.map((h, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border-2 border-slate-200 text-xs font-bold">
                          <span>{h}</span>
                          <button type="button" onClick={() => removeHighlight(idx)} className="text-rose-500 hover:text-rose-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STUDENT TUTORING & PRICING */}
              {activeFormTab === 'student_pricing' && allowsStudents && (
                <div className="flex flex-col gap-6">
                  {/* Modes */}
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1.5">شیوه‌های مجاز تدریس دانش‌آموزان</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300">
                        <input
                          type="checkbox"
                          checked={form.teaching_modes?.includes('online')}
                          onChange={() => toggleMode('online')}
                          className="w-4 h-4 text-teal rounded border-slate-300 focus:ring-teal"
                        />
                        <span>تدریس آنلاین (سراسر کشور)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300">
                        <input
                          type="checkbox"
                          checked={form.teaching_modes?.includes('in_person')}
                          onChange={() => toggleMode('in_person')}
                          className="w-4 h-4 text-teal rounded border-slate-300 focus:ring-teal"
                        />
                        <span>تدریس حضوری</span>
                      </label>
                    </div>
                  </div>

                  {/* Taxonomies: Grades & Subjects for Students */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-black text-slate-900">
                        پایه‌ها و دروس تدریس دانش‌آموزان (تفکیک بر اساس دسته‌بندی مقاطع):
                      </label>
                      <span className="text-xs font-bold text-teal-800 bg-teal/10 px-2.5 py-1 rounded-lg">
                        {form.grades?.length || 0} پایه انتخاب شده • {form.subjects?.length || 0} درس انتخاب شده
                      </span>
                    </div>

                    <div className="flex flex-col gap-6">
                      {Array.from(new Set(availableGrades.map(g => g.category || 'دوره ابتدایی'))).map(categoryName => {
                        const categoryGrades = availableGrades.filter(g => (g.category || 'دوره ابتدایی') === categoryName)
                        const allInCatSelected = categoryGrades.length > 0 && categoryGrades.every(g => form.grades?.includes(g.name))

                        return (
                          <div key={categoryName} className="p-4 rounded-2xl bg-white border-2 border-slate-300 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-200 pb-3 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-teal"></span>
                                <span className="font-black text-slate-900 text-sm">{categoryName}</span>
                                <span className="text-[11px] font-bold text-slate-500">({categoryGrades.length} پایه)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleCategoryGrades(categoryName, !allInCatSelected)}
                                className="text-xs font-black text-teal hover:text-teal-deep px-3 py-1 rounded-xl bg-teal/10 hover:bg-teal/20 transition-colors"
                              >
                                {allInCatSelected ? 'لغو انتخاب همه پایه‌های این دسته' : 'انتخاب همه پایه‌های این دسته'}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryGrades.map(g => {
                                const gradeSubjects = availableSubjects.filter(s => s.grade_id === g.id)
                                const isGradeSelected = form.grades?.includes(g.name)

                                return (
                                  <div
                                    key={g.id}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                                      isGradeSelected
                                        ? 'bg-teal/5 border-teal/40 shadow-xs'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-900">
                                          <input
                                            type="checkbox"
                                            checked={isGradeSelected}
                                            onChange={() => toggleGrade(g.name)}
                                            className="w-4 h-4 text-teal rounded border-slate-300 focus:ring-teal"
                                          />
                                          <span>{g.name}</span>
                                        </label>
                                        {gradeSubjects.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => selectAllGradeSubjects(g.id, g.name)}
                                            className="text-[11px] font-black text-teal hover:text-teal-deep px-2 py-0.5 rounded-md hover:bg-teal/10 transition-colors"
                                          >
                                            انتخاب همه دروس
                                          </button>
                                        )}
                                      </div>

                                      {gradeSubjects.length > 0 ? (
                                        <div className="flex flex-col gap-1.5">
                                          {gradeSubjects.map(s => {
                                            const isSubjectSelected = form.subjects?.includes(s.name)
                                            return (
                                              <label
                                                key={s.id}
                                                className={`flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                                                  isSubjectSelected ? 'bg-white font-bold text-teal-900' : 'text-slate-600 hover:bg-white/60'
                                                }`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isSubjectSelected}
                                                  onChange={() => toggleSubject(s.name, g.name)}
                                                  className="w-3.5 h-3.5 text-teal rounded border-slate-300 focus:ring-teal"
                                                />
                                                <span>{s.name}</span>
                                              </label>
                                            )
                                          })}
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-slate-400 italic">درسی برای این پایه ثبت نشده</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Student Pricing Options */}
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-300">
                    <label className="block text-xs font-black text-slate-900 mb-3">
                      تعرفه‌ها و قیمت جلسات تدریس دانش‌آموزان
                    </label>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newPricingTitle}
                        onChange={e => setNewPricingTitle(e.target.value)}
                        placeholder="عنوان تعرفه (مثلاً جلسه ۶۰ دقیقه عادی)"
                        className="w-full sm:w-56 sm:flex-1 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal shadow-xs"
                      />
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                        <input
                          type="number"
                          value={newDuration}
                          onChange={e => setNewDuration(Number(e.target.value))}
                          placeholder="مدت دقیقه"
                          className="w-full sm:w-28 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal shadow-xs text-center sm:text-right"
                        />
                        <input
                          type="number"
                          value={newPrice}
                          onChange={e => setNewPrice(Number(e.target.value))}
                          placeholder="قیمت تومان"
                          className="w-full sm:w-36 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal shadow-xs text-center sm:text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addPricingOption}
                        className="w-full sm:w-auto px-4 py-2 bg-teal text-white rounded-xl text-xs font-black hover:bg-teal-deep transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>افزودن تعرفه</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {form.pricing_options?.map((p, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-between shadow-2xs">
                          <div>
                            <span className="text-xs font-black text-slate-900 block">{p.title || `جلسه ${p.duration_minutes} دقیقه`}</span>
                            <span className="text-xs font-black text-teal-800" dir="ltr">{Number(p.price_toman).toLocaleString('fa-IR')} تومان</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePricingOption(idx)}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability Schedule */}
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-300">
                    <label className="block text-xs font-black text-slate-900 mb-2">روزهای حضور و تدریس</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {WEEK_DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            form.availability_schedule?.days?.includes(day)
                              ? 'bg-teal text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">ساعات حضور</label>
                        <input
                          type="text"
                          value={form.availability_schedule?.hours || ''}
                          onChange={e => setForm({
                            ...form,
                            availability_schedule: { ...(form.availability_schedule || {}), hours: e.target.value }
                          })}
                          placeholder="مثال: ۱۶:۰۰ الی ۲۱:۰۰"
                          className="w-full px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">توضیحات و شرایط هماهنگی</label>
                        <input
                          type="text"
                          value={form.availability_schedule?.notes || ''}
                          onChange={e => setForm({
                            ...form,
                            availability_schedule: { ...(form.availability_schedule || {}), notes: e.target.value }
                          })}
                          placeholder="مثال: هماهنگی قبلی حداقل ۲۴ ساعت قبل"
                          className="w-full px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TEACHER TRAINING FIELDS & PRICING */}
              {activeFormTab === 'teacher_training' && allowsTeachers && (
                <div className="flex flex-col gap-6">
                  {/* Training Bio */}
                  <div>
                    <label className="block text-xs font-black text-purple-950 mb-1.5">
                      توضیحات و اهداف دوره تربیت معلم با این استاد
                    </label>
                    <textarea
                      value={form.training_bio || ''}
                      onChange={e => setForm({ ...form, training_bio: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-purple-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-purple-600 shadow-xs resize-none"
                      placeholder="درباره رویکرد کارگاهی، انتقال تجربیات مدیریت کلاس و توانمندسازی همکاران..."
                    />
                  </div>

                  {/* Certificate & Video */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">
                        عنوان مدرک یا گواهی اعطایی دوره
                      </label>
                      <input
                        type="text"
                        value={form.training_certificate || ''}
                        onChange={e => setForm({ ...form, training_certificate: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-purple-600 shadow-xs"
                        placeholder="مثال: گواهی معتبر کارگاه روش تدریس نوین ریاضی"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1.5">
                        لینک ویدیوی اختصاصی تربیت معلم (آپارات یا مستقیم)
                      </label>
                      <input
                        type="url"
                        value={form.training_video_url || ''}
                        onChange={e => setForm({ ...form, training_video_url: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-purple-600 shadow-xs"
                        placeholder="https://www.aparat.com/v/..."
                      />
                    </div>
                  </div>

                  {/* Training Topics Manager */}
                  <div className="p-4 bg-purple-50/50 rounded-2xl border-2 border-purple-200">
                    <label className="block text-xs font-black text-purple-950 mb-2">
                      سرفصل‌ها و موضوعات تخصصی تربیت معلم
                    </label>

                    {/* Common Topics Quick Add */}
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">پیشنهادات متداول (کلیک جهت افزودن سریع):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_TRAINING_TOPICS.map((topic, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addTrainingTopic(topic)}
                            disabled={form.training_topics?.includes(topic)}
                            className="px-2.5 py-1 rounded-lg text-xs bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 transition-all font-bold disabled:opacity-40"
                          >
                            + {topic}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTrainingTopic}
                        onChange={e => setNewTrainingTopic(e.target.value)}
                        placeholder="عنوان سرفصل دلخواه جدید..."
                        className="flex-1 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => addTrainingTopic()}
                        className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-black hover:bg-purple-800 transition-all shadow-xs"
                      >
                        افزودن سرفصل
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {form.training_topics?.map((topic, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-purple-950 border-2 border-purple-300 text-xs font-bold shadow-2xs">
                          <span>{topic}</span>
                          <button type="button" onClick={() => removeTrainingTopic(idx)} className="text-rose-500 hover:text-rose-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience Levels */}
                  <div className="p-4 bg-purple-50/50 rounded-2xl border-2 border-purple-200">
                    <label className="block text-xs font-black text-purple-950 mb-2">
                      مخاطبان هدف دوره تربیت معلم
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTrainingLevel}
                        onChange={e => setNewTrainingLevel(e.target.value)}
                        placeholder="مثال: متقاضیان استخدام آموزش و پرورش"
                        className="flex-1 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={addTrainingLevel}
                        className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-black hover:bg-purple-800 transition-all shadow-xs"
                      >
                        افزودن مخاطب
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {form.training_target_levels?.map((lvl, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 text-purple-950 border border-purple-300 text-xs font-bold">
                          <span>{lvl}</span>
                          <button type="button" onClick={() => removeTrainingLevel(idx)} className="text-rose-500 hover:text-rose-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dedicated Teacher Training Pricing Options */}
                  <div className="p-4 bg-purple-50/50 rounded-2xl border-2 border-purple-200">
                    <label className="block text-xs font-black text-purple-950 mb-3">
                      تعرفه‌ها و پکیج‌های مستقل تربیت معلم (ویژه آموزش به همکاران)
                    </label>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newTrainingTitle}
                        onChange={e => setNewTrainingTitle(e.target.value)}
                        placeholder="عنوان دوره یا جلسه (مثلاً کارگاه ۶۰ دقیقه‌ای)"
                        className="w-full sm:w-60 sm:flex-1 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                      />
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                        <input
                          type="number"
                          value={newTrainingDuration}
                          onChange={e => setNewTrainingDuration(Number(e.target.value))}
                          placeholder="مدت دقیقه"
                          className="w-full sm:w-28 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs text-center sm:text-right"
                        />
                        <input
                          type="number"
                          value={newTrainingPrice}
                          onChange={e => setNewTrainingPrice(Number(e.target.value))}
                          placeholder="قیمت تومان"
                          className="w-full sm:w-36 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs text-center sm:text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTrainingPricingOption}
                        className="w-full sm:w-auto px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-black hover:bg-purple-800 transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>افزودن پکیج</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {form.training_pricing_options?.map((p, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border-2 border-purple-200 flex items-center justify-between shadow-2xs">
                          <div>
                            <span className="text-xs font-black text-purple-950 block">{p.title || `دوره ${p.duration_minutes} دقیقه`}</span>
                            <span className="text-xs font-black text-purple-800" dir="ltr">{Number(p.price_toman).toLocaleString('fa-IR')} تومان</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTrainingPricingOption(idx)}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback messages */}
              {error && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={reset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all text-center"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-teal hover:bg-teal-deep text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span>در حال ذخیره...</span>
                  ) : (
                    <span>{editing ? 'ثبت تغییرات استاد' : 'ذخیره و ثبت استاد جدید'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Teachers List Table/Cards */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-slate-300 shadow-md w-full max-w-full">
            <h3 className="text-base font-black text-slate-900 mb-4">لیست کلیه اساتید ثبت شده</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(t => (
                <div key={t.id} className="p-4 rounded-2xl border-2 border-slate-300 bg-slate-50 flex flex-col justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-slate-300" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center font-black text-slate-600">
                        {t.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 truncate">{t.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          t.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.is_visible ? 'فعال' : 'مخفی'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{t.specialty || 'مدرس یار اولی‌ها'}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                        <span className={`px-2 py-0.5 rounded-md font-black ${
                          t.teaching_scope === 'teachers'
                            ? 'bg-purple-100 text-purple-900'
                            : t.teaching_scope === 'both'
                            ? 'bg-slate-900 text-white'
                            : 'bg-teal/10 text-teal-900'
                        }`}>
                          {t.teaching_scope === 'teachers'
                            ? 'تربیت معلم'
                            : t.teaching_scope === 'both'
                            ? 'دانش‌آموزان + معلمان'
                            : 'دانش‌آموزان'}
                        </span>
                        <span className="text-slate-600 font-bold">
                          ★ {t.star_rating || 5.0} ({t.review_count || 0} نظر)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => toggle(t)}
                      className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                    >
                      {t.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{t.is_visible ? 'مخفی‌سازی' : 'نمایش'}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="px-3 py-1 rounded-lg bg-teal text-white font-bold hover:bg-teal-deep transition-all"
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: REVIEWS MODERATION & RATINGS */}
      {/* ============================================================== */}
      {managerTab === 'reviews' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-slate-300 shadow-md flex flex-col gap-5 sm:gap-6 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-slate-200 pb-4 sm:pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                مدیریت نظرات، تجربیات و امتیازات اساتید
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                بررسی و تایید نظرات ثبت شده توسط اولیا و معلمان. امتیاز واقعی اساتید با تایید دیدگاه‌ها به‌طور خودکار بروزرسانی می‌شود.
              </p>
            </div>

            <button
              type="button"
              onClick={loadReviews}
              className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-xs font-black text-slate-800 transition-all flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تازه‌سازی لیست</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border-2 border-slate-200 w-full max-w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scroll-smooth">
                <span className="text-xs font-black text-slate-700 ml-1 shrink-0">وضعیت:</span>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 whitespace-nowrap ${
                    reviewStatusFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  همه ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1 shrink-0 whitespace-nowrap ${
                    reviewStatusFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 border-amber-600'
                      : 'bg-white text-amber-800 border-amber-300'
                  }`}
                >
                  در انتظار تایید ({pendingReviewsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 whitespace-nowrap ${
                    reviewStatusFilter === 'approved'
                      ? 'bg-emerald-700 text-white border-emerald-900'
                      : 'bg-white text-emerald-800 border-emerald-300'
                  }`}
                >
                  تایید شده ({reviews.filter(r => r.is_approved).length})
                </button>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scroll-smooth">
                <span className="text-xs font-black text-slate-700 ml-1 shrink-0">نقش:</span>
                <button
                  type="button"
                  onClick={() => setReviewRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 whitespace-nowrap ${
                    reviewRoleFilter === 'all'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  همه
                </button>
                <button
                  type="button"
                  onClick={() => setReviewRoleFilter('parent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 whitespace-nowrap ${
                    reviewRoleFilter === 'parent'
                      ? 'bg-emerald-700 text-white border-emerald-900'
                      : 'bg-white text-emerald-800 border-emerald-300'
                  }`}
                >
                  والدین
                </button>
                <button
                  type="button"
                  onClick={() => setReviewRoleFilter('teacher')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 whitespace-nowrap ${
                    reviewRoleFilter === 'teacher'
                      ? 'bg-purple-700 text-white border-purple-900'
                      : 'bg-white text-purple-900 border-purple-300'
                  }`}
                >
                  معلمان
                </button>
              </div>

              {/* Teacher Filter */}
              <div className="flex items-center gap-1.5 w-full lg:w-auto">
                <span className="text-xs font-black text-slate-700 ml-1 shrink-0">استاد:</span>
                <select
                  value={reviewTeacherFilter}
                  onChange={e => setReviewTeacherFilter(e.target.value)}
                  className="w-full lg:w-auto px-3 py-1.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal"
                >
                  <option value="all">همه اساتید</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="text-center py-12 text-xs font-bold text-slate-500">
              در حال بارگذاری نظرات...
            </div>
          ) : adminFilteredReviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {adminFilteredReviews.map(r => (
                <div
                  key={r.id}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
                    !r.is_approved
                      ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-200">
                    <div className="flex items-center gap-3">
                      {r.teacher_photo ? (
                        <img src={r.teacher_photo} alt={r.teacher_name || ''} className="w-10 h-10 rounded-xl object-cover border border-slate-300" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                          {r.teacher_name?.slice(0, 1) || '؟'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">استاد: {r.teacher_name}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs font-bold text-slate-700">نظردهنده: {r.reviewer_name}</span>
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
                            <span className="text-[11px] text-slate-500 font-medium">({r.subject_or_topic})</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          تاریخ ثبت: {new Date(r.created_at).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
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
                        <span className="text-xs font-black text-slate-800 mr-1">{r.rating}</span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                        r.is_approved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {r.is_approved ? 'تایید شده' : 'در انتظار بررسی'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200">
                    {r.comment}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleReviewApproval(r)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
                        r.is_approved
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-800 shadow-sm'
                      }`}
                    >
                      {r.is_approved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>لغو تایید (مخفی‌سازی)</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تایید و انتشار دیدگاه</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteReview(r.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-800">هیچ نظری با این مشخصات یافت نشد.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
