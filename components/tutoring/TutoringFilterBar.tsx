'use client'

import { Search, RotateCcw, Monitor, Users, MapPin, Layers, BookOpen } from 'lucide-react'
import { TutoringGrade, TutoringSubject } from '@/lib/teachers'

interface TutoringFilterBarProps {
  grades: TutoringGrade[]
  subjects: TutoringSubject[]
  availableCities: string[]
  selectedMode: string // 'all' | 'online' | 'in_person'
  onChangeMode: (mode: string) => void
  selectedGrade: string
  onChangeGrade: (grade: string) => void
  selectedSubject: string
  onChangeSubject: (subject: string) => void
  selectedCity: string
  onChangeCity: (city: string) => void
  searchTerm: string
  onChangeSearch: (term: string) => void
  onReset: () => void
  totalCount: number
}

export function TutoringFilterBar({
  grades,
  subjects,
  availableCities,
  selectedMode,
  onChangeMode,
  selectedGrade,
  onChangeGrade,
  selectedSubject,
  onChangeSubject,
  selectedCity,
  onChangeCity,
  searchTerm,
  onChangeSearch,
  onReset,
  totalCount
}: TutoringFilterBarProps) {
  // Filter subjects available for the selected grade
  const filteredSubjects = selectedGrade
    ? subjects.filter(s => {
        const matchingGrade = grades.find(g => g.name === selectedGrade)
        return matchingGrade ? s.grade_id === matchingGrade.id : true
      })
    : subjects

  const hasActiveFilters = selectedMode !== 'all' || selectedGrade !== '' || selectedSubject !== '' || selectedCity !== '' || searchTerm !== ''

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
      {/* Top row: Title & Matching count & Reset */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal"></span>
          <span className="font-black text-slate-800 text-sm md:text-base">نوع تدریس و درس انتخابی</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            اساتید در دسترس: <span className="text-teal font-black text-sm">{totalCount.toLocaleString('fa-IR')}</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌سازی فیلترها</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Step 1: Mode Selection (حضوری / آنلاین) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-teal" />
            <span>۱. شیوه برگزاری</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => onChangeMode('all')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                selectedMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('online')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                selectedMode === 'online'
                  ? 'bg-teal text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آنلاین
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('in_person')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                selectedMode === 'in_person'
                  ? 'bg-tangerine text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حضوری
            </button>
          </div>
        </div>

        {/* Step 2: Grade Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal" />
            <span>۲. پایه تحصیلی</span>
          </label>
          <select
            value={selectedGrade}
            onChange={e => {
              onChangeGrade(e.target.value)
              onChangeSubject('') // Reset subject if grade changes
            }}
            className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-teal transition-colors"
          >
            <option value="">همه پایه‌ها</option>
            {grades.map(g => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Subject Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal" />
            <span>۳. درس مورد نظر</span>
          </label>
          <select
            value={selectedSubject}
            onChange={e => onChangeSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-teal transition-colors"
          >
            <option value="">همه دروس</option>
            {filteredSubjects.map(s => (
              <option key={s.id} value={s.name}>
                {s.name} {s.grade_name ? `(${s.grade_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter (if in person or available) or Search */}
        {selectedMode === 'in_person' && availableCities.length > 0 ? (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>شهر تدریس حضوری</span>
            </label>
            <select
              value={selectedCity}
              onChange={e => onChangeCity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-teal transition-colors"
            >
              <option value="">همه شهرها</option>
              {availableCities.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>جستجوی نام استاد</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => onChangeSearch(e.target.value)}
                placeholder="نام استاد، تخصص، سابقه..."
                className="w-full pr-3 pl-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-teal transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onChangeSearch('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
