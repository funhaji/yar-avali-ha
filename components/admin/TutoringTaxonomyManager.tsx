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
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* GRADES SECTION */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-black text-lg">
              <Layers className="w-5 h-5 text-teal" />
              <span>پایه‌های تحصیلی ({grades.length})</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">مدیریت مقاطع تدریس</span>
          </div>

          <form onSubmit={handleSaveGrade} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
            <div className="font-bold text-sm text-slate-700">
              {editingGrade ? 'ویرایش پایه تحصیلی' : 'افزودن پایه تحصیلی جدید'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="عنوان پایه (مثلاً: پایه اول دبستان)"
                  value={gradeName}
                  onChange={e => setGradeName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="ترتیب نمایش"
                  value={gradeOrder}
                  onChange={e => setGradeOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end pt-1">
              {editingGrade && (
                <button
                  type="button"
                  onClick={cancelEditGrade}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold transition-colors"
                >
                  انصراف
                </button>
              )}
              <button
                type="submit"
                disabled={savingGrade}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs text-white bg-teal hover:bg-teal-deep rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {editingGrade ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingGrade ? 'ذخیره تغییرات' : 'افزودن پایه'}</span>
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">در حال بارگذاری...</div>
          ) : grades.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm leading-relaxed">
              هنوز هیچ پایه تحصیلی ثبت نشده است.
              <br />
              برای فعال‌سازی فیلتر پایه در صفحه تدریس خصوصی، ابتدا پایه‌ها را از فرم بالا اضافه کنید.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
              {grades.map(g => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-600 text-xs font-bold flex items-center justify-center">
                      {g.display_order}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditGrade(g)}
                      className="p-1.5 text-slate-500 hover:text-teal hover:bg-white rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGrade(g.id, g.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
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
        <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-black text-lg">
              <BookOpen className="w-5 h-5 text-tangerine" />
              <span>دروس و مباحث ({subjects.length})</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">مدیریت عناوین درسی</span>
          </div>

          <form onSubmit={handleSaveSubject} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
            <div className="font-bold text-sm text-slate-700">
              {editingSubject ? 'ویرایش درس' : 'افزودن درس جدید'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="عنوان درس (مثلاً: فارسی، ریاضی، علوم)"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-tangerine"
                  required
                />
              </div>
              <div>
                <select
                  value={subjectGradeId}
                  onChange={e => setSubjectGradeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-tangerine"
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
                className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-tangerine"
              />
              <div className="flex items-center gap-2">
                {editingSubject && (
                  <button
                    type="button"
                    onClick={cancelEditSubject}
                    className="px-3 py-1.5 text-xs text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold transition-colors"
                  >
                    انصراف
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingSubject}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs text-white bg-tangerine hover:bg-tangerine-deep rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {editingSubject ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingSubject ? 'ذخیره تغییرات' : 'افزودن درس'}</span>
                </button>
              </div>
            </div>
          </form>

          {grades.length > 0 && (
            <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
              <span className="text-slate-400 font-bold whitespace-nowrap">فیلتر پایه:</span>
              <button
                type="button"
                onClick={() => setSelectedFilterGrade('all')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition-all ${
                  selectedFilterGrade === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                همه ({subjects.length})
              </button>
              {grades.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedFilterGrade(g.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition-all ${
                    selectedFilterGrade === g.id
                      ? 'bg-tangerine text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">در حال بارگذاری...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm leading-relaxed">
              هنوز درسی در این بخش ثبت نشده است.
              <br />
              برای اینکه کاربران بتوانند درس مورد نظر را فیلتر و انتخاب کنند، دروس را از فرم بالا اضافه نمایید.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredSubjects.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-600 text-xs font-bold flex items-center justify-center">
                      {s.display_order}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                      {s.grade_name && (
                        <div className="text-xs text-slate-400 mt-0.5">{s.grade_name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditSubject(s)}
                      className="p-1.5 text-slate-500 hover:text-tangerine hover:bg-white rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(s.id, s.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
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
