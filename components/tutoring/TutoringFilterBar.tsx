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
    <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-slate-300 shadow-md flex flex-col gap-5">
      {/* Top row: Title & Matching count & Reset */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-teal"></span>
          <span className="font-black text-slate-900 text-sm md:text-base">نوع تدریس و درس انتخابی</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-black text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-xl border-2 border-slate-300 shadow-xs">
            اساتید در دسترس: <span className="text-teal-700 font-black text-sm">{totalCount.toLocaleString('fa-IR')}</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all shadow-xs"
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
          <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-teal" />
            <span>۱. شیوه برگزاری</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300">
            <button
              type="button"
              onClick={() => onChangeMode('all')}
              className={`py-2 text-xs font-black rounded-xl transition-all border ${
                selectedMode === 'all'
                  ? 'bg-white text-slate-950 border-slate-300 shadow-xs'
                  : 'text-slate-700 border-transparent hover:text-slate-950'
              }`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('online')}
              className={`py-2 text-xs font-black rounded-xl transition-all border ${
                selectedMode === 'online'
                  ? 'bg-teal text-white border-teal-700 shadow-sm'
                  : 'text-slate-700 border-transparent hover:text-slate-950'
              }`}
            >
              آنلاین
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('in_person')}
              className={`py-2 text-xs font-black rounded-xl transition-all border ${
                selectedMode === 'in_person'
                  ? 'bg-tangerine text-white border-tangerine-deep shadow-sm'
                  : 'text-slate-700 border-transparent hover:text-slate-950'
              }`}
            >
              حضوری
            </button>
          </div>
        </div>

        {/* Step 2: Grade Selection */}
        <div>
          <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal" />
            <span>۲. پایه تحصیلی</span>
          </label>
          <select
            value={selectedGrade}
            onChange={e => {
              onChangeGrade(e.target.value)
              onChangeSubject('')
            }}
            className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-teal transition-all shadow-xs"
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
          <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal" />
            <span>۳. درس مورد نظر</span>
          </label>
          <select
            value={selectedSubject}
            onChange={e => onChangeSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-teal transition-all shadow-xs"
          >
            <option value="">همه دروس</option>
            {filteredSubjects.map(s => (
              <option key={s.id} value={s.name}>
                {s.name} {s.grade_name ? `(${s.grade_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter or Search */}
        {selectedMode === 'in_person' && availableCities.length > 0 ? (
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>شهر تدریس حضوری</span>
            </label>
            <select
              value={selectedCity}
              onChange={e => onChangeCity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-teal transition-all shadow-xs"
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
            <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-500" />
              <span>جستجوی نام استاد</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => onChangeSearch(e.target.value)}
                placeholder="نام استاد، تخصص، سابقه..."
                className="w-full pr-3.5 pl-8 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onChangeSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs font-bold"
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
