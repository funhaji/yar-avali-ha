'use client'

import { useState, useMemo } from 'react'
import { TutoringFilterBar } from './TutoringFilterBar'
import { TeacherCard } from './TeacherCard'
import { TutoringBookingModal } from './TutoringBookingModal'
import { TeacherResumeModal } from './TeacherResumeModal'
import { Teacher, PricingOption, TutoringGrade, TutoringSubject } from '@/lib/teachers'
import { Users, SearchX } from 'lucide-react'

interface TutoringDirectoryProps {
  initialTeachers: Teacher[]
  grades: TutoringGrade[]
  subjects: TutoringSubject[]
}

export function TutoringDirectory({
  initialTeachers,
  grades,
  subjects
}: TutoringDirectoryProps) {
  // Filters
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Modals state
  const [bookingTeacher, setBookingTeacher] = useState<Teacher | null>(null)
  const [bookingPricing, setBookingPricing] = useState<PricingOption | undefined>(undefined)
  const [resumeTeacher, setResumeTeacher] = useState<Teacher | null>(null)

  // Extract all available cities for in-person tutoring
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>()
    initialTeachers.forEach(t => {
      if (t.cities && Array.isArray(t.cities)) {
        t.cities.forEach(c => citiesSet.add(c.trim()))
      }
      if (t.location) {
        citiesSet.add(t.location.trim())
      }
    })
    return Array.from(citiesSet).filter(Boolean)
  }, [initialTeachers])

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter(t => {
      // Filter 1: Teaching Mode
      if (selectedMode !== 'all') {
        const modes = t.teaching_modes || ['online', 'in_person']
        if (!modes.includes(selectedMode)) return false
      }

      // Filter 2: Grade
      if (selectedGrade) {
        if (!t.grades || !t.grades.includes(selectedGrade)) return false
      }

      // Filter 3: Subject
      if (selectedSubject) {
        if (!t.subjects || !t.subjects.includes(selectedSubject)) return false
      }

      // Filter 4: City (if specified)
      if (selectedCity) {
        const hasCityInList = t.cities && t.cities.includes(selectedCity)
        const hasCityInLocation = t.location && t.location.includes(selectedCity)
        if (!hasCityInList && !hasCityInLocation) return false
      }

      // Filter 5: Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchName = t.name?.toLowerCase().includes(term)
        const matchSpecialty = t.specialty?.toLowerCase().includes(term)
        const matchBio = t.bio?.toLowerCase().includes(term)
        const matchEducation = t.education?.toLowerCase().includes(term)
        const matchHighlights = t.highlights?.some(h => h.toLowerCase().includes(term))
        if (!matchName && !matchSpecialty && !matchBio && !matchEducation && !matchHighlights) return false
      }

      return true
    })
  }, [initialTeachers, selectedMode, selectedGrade, selectedSubject, selectedCity, searchTerm])

  function resetFilters() {
    setSelectedMode('all')
    setSelectedGrade('')
    setSelectedSubject('')
    setSelectedCity('')
    setSearchTerm('')
  }

  function handleOpenBooking(teacher: Teacher, pricing?: PricingOption) {
    setBookingTeacher(teacher)
    setBookingPricing(pricing)
  }

  function handleOpenResume(teacher: Teacher) {
    setResumeTeacher(teacher)
  }

  return (
    <section className="flex flex-col gap-8">
      {/* Interactive 3-step Filter Bar */}
      <TutoringFilterBar
        grades={grades}
        subjects={subjects}
        availableCities={availableCities}
        selectedMode={selectedMode}
        onChangeMode={setSelectedMode}
        selectedGrade={selectedGrade}
        onChangeGrade={setSelectedGrade}
        selectedSubject={selectedSubject}
        onChangeSubject={setSelectedSubject}
        selectedCity={selectedCity}
        onChangeCity={setSelectedCity}
        searchTerm={searchTerm}
        onChangeSearch={setSearchTerm}
        onReset={resetFilters}
        totalCount={filteredTeachers.length}
      />

      {/* Teachers Grid */}
      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map(teacher => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onOpenBooking={handleOpenBooking}
              onOpenResume={handleOpenResume}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            استادی با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            می‌توانید فیلترهای شیوه برگزاری، پایه یا درس انتخابی را تغییر دهید تا اساتید بیشتری نمایش داده شوند.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 px-5 py-2 rounded-2xl bg-teal text-white font-bold text-xs hover:bg-teal-deep transition-colors"
          >
            مشاهده تمام اساتید
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <TutoringBookingModal
        isOpen={Boolean(bookingTeacher)}
        onClose={() => setBookingTeacher(null)}
        teacher={bookingTeacher}
        initialPricing={bookingPricing}
        grades={grades}
        subjects={subjects}
        defaultMode={selectedMode}
        defaultGrade={selectedGrade}
        defaultSubject={selectedSubject}
        defaultCity={selectedCity}
      />

      {/* Resume Modal */}
      <TeacherResumeModal
        isOpen={Boolean(resumeTeacher)}
        onClose={() => setResumeTeacher(null)}
        teacher={resumeTeacher}
        onOpenBooking={t => {
          setResumeTeacher(null)
          handleOpenBooking(t)
        }}
      />
    </section>
  )
}
