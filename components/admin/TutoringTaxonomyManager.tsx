'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Layers, BookOpen, Check, X, AlertCircle } from 'lucide-react'

interface Grade {
  id: string
  name: string
  display_order: number
  is_active: boolean
}

interface Subject {
  id: string
  name: string
  grade_id: string | null
  grade_name?: string | null
  display_order: number
  is_active: boolean
}

export function TutoringTaxonomyManager() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Grade form state
  const [gradeName, setGradeName] = useState('')
  const [gradeOrder, setGradeOrder] = useState<number>(0)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [savingGrade, setSavingGrade] = useState(false)

  // Subject form state
  const [subjectName, setSubjectName] = useState('')
  const [subjectGradeId, setSubjectGradeId] = useState<string>('')
  const [subjectOrder, setSubjectOrder] = useState<number>(0)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [savingSubject, setSavingSubject] = useState(false)

  // Filter subjects by grade in admin view
  const [selectedFilterGrade, setSelectedFilterGrade] = useState<string>('all')

  useEffect(() => {
    loadTaxonomies()
  }, [])

  function showMessage(text: string, type: 'success' | 'error' = 'success') {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  async function loadTaxonomies() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tutoring/taxonomies')
      if (res.ok) {
        const data = await res.json()
        setGrades(data.grades || [])
        setSubjects(data.subjects || [])
      }
    } catch {
      showMessage('خطا در بارگذاری پایه‌ها و دروس', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Grade Handlers ---
  async function handleSaveGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!gradeName.trim()) return
    setSavingGrade(true)
    try {
      const method = editingGrade ? 'PUT' : 'POST'
      const payload = editingGrade
        ? { id: editingGrade.id, name: gradeName.trim(), display_order: gradeOrder, is_active: editingGrade.is_active }
        : { name: gradeName.trim(), display_order: gradeOrder, is_active: true }

      const res = await fetch('/api/admin/tutoring/grades', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت پایه')

      showMessage(editingGrade ? 'پایه با موفقیت ویرایش شد' : 'پایه جدید افزوده شد')
      setGradeName('')
      setGradeOrder(0)
      setEditingGrade(null)
      loadTaxonomies()
    } catch (err: any) {
      showMessage(err.message, 'error')
    } finally {
      setSavingGrade(false)
    }
  }

  async function handleDeleteGrade(id: string, name: string) {
    if (!confirm(`آیا از حذف پایه "${name}" اطمینان دارید؟ با حذف این پایه تمام درس‌های مرتبط با آن نیز حذف خواهند شد.`)) return
    try {
      const res = await fetch('/api/admin/tutoring/grades', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'خطا در حذف پایه')
      }
      showMessage('پایه حذف شد')
      loadTaxonomies()
    } catch (err: any) {
      showMessage(err.message, 'error')
    }
  }

  function startEditGrade(g: Grade) {
    setEditingGrade(g)
    setGradeName(g.name)
    setGradeOrder(g.display_order)
  }

  function cancelEditGrade() {
    setEditingGrade(null)
    setGradeName('')
    setGradeOrder(0)
  }

  // --- Subject Handlers ---
  async function handleSaveSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!subjectName.trim()) return
    setSavingSubject(true)
    try {
      const method = editingSubject ? 'PUT' : 'POST'
      const payload = editingSubject
        ? { id: editingSubject.id, name: subjectName.trim(), grade_id: subjectGradeId || null, display_order: subjectOrder, is_active: editingSubject.is_active }
        : { name: subjectName.trim(), grade_id: subjectGradeId || null, display_order: subjectOrder, is_active: true }

      const res = await fetch('/api/admin/tutoring/subjects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطا در ثبت درس')

      showMessage(editingSubject ? 'درس با موفقیت ویرایش شد' : 'درس جدید افزوده شد')
      setSubjectName('')
      setSubjectGradeId('')
      setSubjectOrder(0)
      setEditingSubject(null)
      loadTaxonomies()
    } catch (err: any) {
      showMessage(err.message, 'error')
    } finally {
      setSavingSubject(false)
    }
  }

  async function handleDeleteSubject(id: string, name: string) {
    if (!confirm(`آیا از حذف درس "${name}" اطمینان دارید؟`)) return
    try {
      const res = await fetch('/api/admin/tutoring/subjects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'خطا در حذف درس')
      }
      showMessage('درس حذف شد')
      loadTaxonomies()
    } catch (err: any) {
      showMessage(err.message, 'error')
    }
  }

  function startEditSubject(s: Subject) {
    setEditingSubject(s)
    setSubjectName(s.name)
    setSubjectGradeId(s.grade_id || '')
    setSubjectOrder(s.display_order)
  }

  function cancelEditSubject() {
    setEditingSubject(null)
    setSubjectName('')
    setSubjectGradeId('')
    setSubjectOrder(0)
  }

  const filteredSubjects = selectedFilterGrade === 'all'
    ? subjects
    : subjects.filter(s => s.grade_id === selectedFilterGrade)

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-black border-2 shadow-xs transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* GRADES SECTION */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-300 shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-lg">
              <Layers className="w-5 h-5 text-teal" />
              <span>پایه‌های تحصیلی ({grades.length})</span>
            </div>
            <span className="text-xs text-slate-500 font-bold">مدیریت مقاطع تدریس</span>
          </div>

          <form onSubmit={handleSaveGrade} className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-300 flex flex-col gap-4 shadow-xs">
            <div className="font-black text-xs text-slate-900">
              {editingGrade ? 'ویرایش پایه تحصیلی' : 'افزودن پایه تحصیلی جدید'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="عنوان پایه (مثلاً: پایه اول دبستان)"
                  value={gradeName}
                  onChange={e => setGradeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 shadow-xs"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="ترتیب نمایش"
                  value={gradeOrder}
                  onChange={e => setGradeOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal shadow-xs text-center"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end pt-1">
              {editingGrade && (
                <button
                  type="button"
                  onClick={cancelEditGrade}
                  className="px-4 py-2 text-xs text-slate-700 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl font-bold transition-all shadow-xs"
                >
                  انصراف
                </button>
              )}
              <button
                type="submit"
                disabled={savingGrade}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-teal hover:bg-teal-deep border-2 border-teal-700 rounded-xl font-black transition-all shadow-xs disabled:opacity-50"
              >
                {editingGrade ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingGrade ? 'ذخیره تغییرات' : 'افزودن پایه'}</span>
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8 text-slate-500 font-medium text-xs">در حال بارگذاری...</div>
          ) : grades.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 text-xs font-medium leading-relaxed">
              هنوز هیچ پایه تحصیلی ثبت نشده است.
              <br />
              برای فعال‌سازی فیلتر پایه در صفحه تدریس خصوصی، ابتدا پایه‌ها را از فرم بالا اضافه کنید.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
              {grades.map(g => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-400 shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black flex items-center justify-center">
                      {g.display_order}
                    </span>
                    <span className="font-black text-slate-900 text-sm">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditGrade(g)}
                      className="p-1.5 text-slate-600 hover:text-teal hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGrade(g.id, g.name)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SUBJECTS SECTION */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-300 shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-lg">
              <BookOpen className="w-5 h-5 text-tangerine" />
              <span>دروس و مباحث ({subjects.length})</span>
            </div>
            <span className="text-xs text-slate-500 font-bold">مدیریت عناوین درسی</span>
          </div>

          <form onSubmit={handleSaveSubject} className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-300 flex flex-col gap-4 shadow-xs">
            <div className="font-black text-xs text-slate-900">
              {editingSubject ? 'ویرایش درس' : 'افزودن درس جدید'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="عنوان درس (مثلاً: فارسی، ریاضی، علوم)"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-tangerine focus:ring-3 focus:ring-tangerine/20 shadow-xs"
                  required
                />
              </div>
              <div>
                <select
                  value={subjectGradeId}
                  onChange={e => setSubjectGradeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-tangerine shadow-xs"
                >
                  <option value="">پایه مرتبط (اختیاری)</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <input
                type="number"
                placeholder="ترتیب نمایش"
                value={subjectOrder}
                onChange={e => setSubjectOrder(Number(e.target.value))}
                className="w-24 px-3.5 py-2 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold text-center focus:outline-none focus:border-tangerine shadow-xs"
              />
              <div className="flex items-center gap-2">
                {editingSubject && (
                  <button
                    type="button"
                    onClick={cancelEditSubject}
                    className="px-4 py-2 text-xs text-slate-700 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl font-bold transition-all shadow-xs"
                  >
                    انصراف
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingSubject}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-tangerine hover:bg-tangerine-deep border-2 border-tangerine-deep rounded-xl font-black transition-all shadow-xs disabled:opacity-50"
                >
                  {editingSubject ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingSubject ? 'ذخیره تغییرات' : 'افزودن درس'}</span>
                </button>
              </div>
            </div>
          </form>

          {grades.length > 0 && (
            <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
              <span className="text-slate-600 font-black whitespace-nowrap">فیلتر پایه:</span>
              <button
                type="button"
                onClick={() => setSelectedFilterGrade('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border-2 ${
                  selectedFilterGrade === 'all'
                    ? 'bg-slate-900 text-white border-slate-950 font-black shadow-xs'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                }`}
              >
                همه ({subjects.length})
              </button>
              {grades.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedFilterGrade(g.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border-2 ${
                    selectedFilterGrade === g.id
                      ? 'bg-tangerine text-white border-tangerine-deep font-black shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-500 font-medium text-xs">در حال بارگذاری...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 text-xs font-medium leading-relaxed">
              هنوز درسی در این بخش ثبت نشده است.
              <br />
              برای اینکه کاربران بتوانند درس مورد نظر را فیلتر و انتخاب کنند، دروس را از فرم بالا اضافه نمایید.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredSubjects.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-400 shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black flex items-center justify-center">
                      {s.display_order}
                    </span>
                    <div>
                      <div className="font-black text-slate-900 text-sm">{s.name}</div>
                      {s.grade_name && (
                        <div className="text-xs text-slate-500 font-bold mt-0.5">{s.grade_name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditSubject(s)}
                      className="p-1.5 text-slate-600 hover:text-tangerine hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(s.id, s.name)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
