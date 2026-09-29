'use client'

import { useState, useMemo } from 'react'
import { TeacherCard } from './TeacherCard'
import { TutoringBookingModal } from './TutoringBookingModal'
import { TeacherResumeModal } from './TeacherResumeModal'
import { Teacher, PricingOption } from '@/lib/teachers'
import { GraduationCap, Search, SearchX, CheckCircle2, Monitor, MapPin, Sparkles } from 'lucide-react'

interface TeacherTrainingDirectoryProps {
  initialTeachers: Teacher[]
}

export function TeacherTrainingDirectory({ initialTeachers }: TeacherTrainingDirectoryProps) {
  // Only teachers who teach teachers
  const trainingTeachers = useMemo(() => {
    return initialTeachers.filter(t => t.teaching_scope === 'teachers' || t.teaching_scope === 'both')
  }, [initialTeachers])

  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Modals state
  const [bookingTeacher, setBookingTeacher] = useState<Teacher | null>(null)
  const [bookingPricing, setBookingPricing] = useState<PricingOption | undefined>(undefined)
  const [resumeTeacher, setResumeTeacher] = useState<Teacher | null>(null)

  // Collect all unique topics from teachers
  const availableTopics = useMemo(() => {
    const set = new Set<string>()
    trainingTeachers.forEach(t => {
      if (t.training_topics && Array.isArray(t.training_topics)) {
        t.training_topics.forEach(tp => set.add(tp.trim()))
      }
    })
    return Array.from(set).filter(Boolean)
  }, [trainingTeachers])

  // Collect all unique target levels from teachers
  const availableLevels = useMemo(() => {
    const set = new Set<string>()
    trainingTeachers.forEach(t => {
      if (t.training_target_levels && Array.isArray(t.training_target_levels)) {
        t.training_target_levels.forEach(l => set.add(l.trim()))
      }
    })
    return Array.from(set).filter(Boolean)
  }, [trainingTeachers])

  // Filter logic
  const filteredTeachers = useMemo(() => {
    return trainingTeachers.filter(t => {
      // Mode filter
      if (selectedMode !== 'all') {
        const modes = t.teaching_modes || ['online', 'in_person']
        if (!modes.includes(selectedMode)) return false
      }

      // Topic filter
      if (selectedTopic !== 'all') {
        if (!t.training_topics || !t.training_topics.some(tp => tp.includes(selectedTopic) || selectedTopic.includes(tp))) {
          return false
        }
      }

      // Target level filter
      if (selectedLevel !== 'all') {
        if (!t.training_target_levels || !t.training_target_levels.some(l => l.includes(selectedLevel) || selectedLevel.includes(l))) {
          return false
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchName = t.name?.toLowerCase().includes(term)
        const matchSpecialty = t.specialty?.toLowerCase().includes(term)
        const matchBio = t.training_bio?.toLowerCase().includes(term) || t.bio?.toLowerCase().includes(term)
        const matchTopic = t.training_topics?.some(tp => tp.toLowerCase().includes(term))
        if (!matchName && !matchSpecialty && !matchBio && !matchTopic) return false
      }

      return true
    })
  }, [trainingTeachers, selectedMode, selectedTopic, selectedLevel, searchTerm])

  return (
    <section className="flex flex-col gap-8 w-full">
      {/* Filters Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 border-2 border-purple-300 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                مدرسان تخصصی دوره تربیت معلم
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                انتخاب استاد، سرفصل آموزشی و ثبت‌نام در جلسات انتقال تجربه و مهارت‌آموزی
              </p>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجوی نام استاد، سرفصل یا تخصص..."
              className="w-full pr-10 pl-4 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-3 focus:ring-purple-200 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 whitespace-nowrap">شیوه برگزاری:</span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => setSelectedMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all font-black ${
                  selectedMode === 'all'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                همه شیوه‌ها
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('online')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all font-black flex items-center gap-1 ${
                  selectedMode === 'online'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>آنلاین</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('in_person')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all font-black flex items-center gap-1 ${
                  selectedMode === 'in_person'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>حضوری</span>
              </button>
            </div>
          </div>

          {/* Level Filter if available */}
          {availableLevels.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 whitespace-nowrap">مخاطب دوره:</span>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-purple-600 shadow-xs"
              >
                <option value="all">همه مخاطبان</option>
                {availableLevels.map((lvl, idx) => (
                  <option key={idx} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Topics Chips */}
        {availableTopics.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-800">سرفصل‌های آموزشی معلمان:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedTopic('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all border-2 font-black ${
                  selectedTopic === 'all'
                    ? 'bg-purple-700 text-white border-purple-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                همه موضوعات ({trainingTeachers.length})
              </button>
              {availableTopics.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs transition-all border-2 font-black ${
                    selectedTopic === topic
                      ? 'bg-purple-700 text-white border-purple-900 shadow-xs'
                      : 'bg-white text-purple-950 border-purple-200 hover:border-purple-400'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map(teacher => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              cardType="teacher_training"
              onOpenBooking={(t, p) => {
                setBookingTeacher(t)
                setBookingPricing(p)
              }}
              onOpenResume={t => setResumeTeacher(t)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300 shadow-sm flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">مدرسی با این مشخصات یافت نشد</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            می‌توانید فیلتر سرفصل یا شیوه برگزاری را تغییر دهید تا اساتید دیگر دوره تربیت معلم نمایش داده شوند.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTopic('all')
              setSelectedMode('all')
              setSelectedLevel('all')
              setSearchTerm('')
            }}
            className="mt-2 px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-black hover:bg-purple-800 transition-all shadow-xs"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}

      {/* Modals */}
      <TutoringBookingModal
        isOpen={!!bookingTeacher}
        onClose={() => setBookingTeacher(null)}
        teacher={bookingTeacher}
        initialPricing={bookingPricing}
        defaultMode={selectedMode === 'all' ? 'online' : selectedMode}
        bookingType="teacher_training"
      />

      <TeacherResumeModal
        isOpen={!!resumeTeacher}
        onClose={() => setResumeTeacher(null)}
        teacher={resumeTeacher}
        initialTab="training"
        onOpenBooking={t => {
          setResumeTeacher(null)
          setBookingTeacher(t)
        }}
      />
    </section>
  )
}
