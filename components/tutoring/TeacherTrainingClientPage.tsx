'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Users, Sparkles, CheckCircle2, Award, BookOpen } from 'lucide-react'
import { TutoringDirectory } from './TutoringDirectory'
import { TeacherTrainingDirectory } from './TeacherTrainingDirectory'
import { Teacher, TutoringGrade, TutoringSubject } from '@/lib/teachers'
import { getEmbedUrl } from '@/lib/video'

interface TeacherTrainingClientPageProps {
  teachers: Teacher[]
  grades: TutoringGrade[]
  subjects: TutoringSubject[]
  settings: Record<string, string | null>
}

export function TeacherTrainingClientPage({
  teachers,
  grades,
  subjects,
  settings: s
}: TeacherTrainingClientPageProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students')

  // Filter teachers for students
  const studentTeachers = teachers.filter(t => t.teaching_scope === 'students' || t.teaching_scope === 'both' || !t.teaching_scope)
  // Filter teachers for teachers
  const trainingTeachers = teachers.filter(t => t.teaching_scope === 'teachers' || t.teaching_scope === 'both')

  return (
    <main className="shell flex-1 py-8 md:py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-700 hover:text-teal transition-colors w-fit px-3.5 py-1.5 rounded-xl bg-white border-2 border-slate-300 shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/10 text-teal-900 border border-teal/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>سامانه جامع معلمان و آموزش تخصصی دبستان</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            تدریس خصوصی دانش‌آموزان و دوره تربیت معلم
          </h1>

          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
            پلتفرم تخصصی آموزش مقطع دبستان: انتخاب معلم خصوصی برای فرزندتان یا ثبت‌نام در دوره‌های جامع مهارت‌آموزی و روش تدریس ویژه نومعلمان و همکاران فرهنگی.
          </p>
        </div>

        {/* Master Tab Selector */}
        <div className="bg-slate-200/90 p-2 rounded-3xl max-w-xl mx-auto w-full flex items-center gap-2 border-2 border-slate-300 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-2 ${
              activeTab === 'students'
                ? 'bg-teal text-white border-teal-700 shadow-md font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:text-slate-950 font-bold shadow-xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>آموزش دانش‌آموزان ({studentTeachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-2 ${
              activeTab === 'teachers'
                ? 'bg-purple-700 text-white border-purple-900 shadow-md font-black'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:text-slate-950 font-bold shadow-xs'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>تربیت معلم و همکاران ({trainingTeachers.length})</span>
          </button>
        </div>

        {/* TAB 1: TEACHING STUDENTS (TUTORING) */}
        {activeTab === 'students' && (
          <TutoringDirectory
            initialTeachers={studentTeachers}
            grades={grades}
            subjects={subjects}
          />
        )}

        {/* TAB 2: TEACHING TEACHERS (TEACHER TRAINING) */}
        {activeTab === 'teachers' && (
          <div className="flex flex-col gap-10">
            {/* Top Course Teaser Card */}
            <section className="bg-white rounded-3xl p-6 md:p-10 border-2 border-slate-300 shadow-md flex flex-col gap-8 max-w-4xl mx-auto w-full">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 border-2 border-purple-300 text-purple-800 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {s?.tt_card2_title || 'دوره جامع مهارت‌آموزی و تربیت معلم مقطع ابتدایی'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
                  {s?.tt_card2_desc || 'در دوره‌های تربیت معلم یار اولی‌ها، شما با جدیدترین شیوه‌های تدریس نوین، روانشناسی کودک و مدیریت کلاس مقطع دبستان آشنا می‌شوید. این دوره به همراه ارائه گواهی معتبر و جلسات عملی برگزار خواهد شد.'}
                </p>
              </div>

              {s?.tt_video_url && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border-4 border-slate-300">
                  <iframe
                    src={getEmbedUrl(s.tt_video_url)}
                    className="w-full h-full border-none"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-800">
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-700 flex-shrink-0" />
                  <span>آموزش روش‌های نوین تدریس</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-700 flex-shrink-0" />
                  <span>پشتیبانی و جلسات رفع اشکال</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-700 flex-shrink-0" />
                  <span>اعطای گواهی معتبر پایان دوره</span>
                </div>
              </div>
            </section>

            {/* Specialized Teacher Training Directory */}
            <TeacherTrainingDirectory
              initialTeachers={trainingTeachers}
            />
          </div>
        )}
      </div>
    </main>
  )
}
