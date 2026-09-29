'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Users, Sparkles, CheckCircle2 } from 'lucide-react'
import { TutoringDirectory } from './TutoringDirectory'
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
  const [activeTab, setActiveTab] = useState<'tutoring' | 'training'>('tutoring')

  return (
    <main className="shell flex-1 py-8 md:py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500 hover:text-teal transition-colors w-fit"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سامانه جامع معلمان و آموزش تخصصی</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            تدریس خصوصی و دوره‌های آموزشی
          </h1>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">
            با بهترین معلمان و اساتید مقطع ابتدایی، یادگیری فرزندتان را شیرین و پایدار کنید. امکان تدریس آنلاین تصویری در سراسر کشور یا تدریس حضوری در شهر شما.
          </p>
        </div>

        {/* Master Tab Selector */}
        <div className="bg-slate-100/90 p-1.5 rounded-2xl max-w-md mx-auto w-full flex items-center gap-1.5 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('tutoring')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tutoring'
                ? 'bg-teal text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>معلم خصوصی ({teachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('training')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'training'
                ? 'bg-teal text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>دوره تربیت معلم</span>
          </button>
        </div>

        {/* TAB 1: TUTORING DIRECTORY */}
        {activeTab === 'tutoring' && (
          <TutoringDirectory
            initialTeachers={teachers}
            grades={grades}
            subjects={subjects}
          />
        )}

        {/* TAB 2: TEACHER TRAINING COURSE */}
        {activeTab === 'training' && (
          <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200/80 shadow-sm flex flex-col gap-8 max-w-4xl mx-auto w-full">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {s?.tt_card2_title || 'دوره جامع تربیت معلم مقطع ابتدایی'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {s?.tt_card2_desc || 'در دوره‌های تربیت معلم یار اولی‌ها، شما با جدیدترین شیوه‌های تدریس نوین، روانشناسی کودک و مدیریت کلاس مقطع دبستان آشنا می‌شوید. این دوره به همراه ارائه گواهی معتبر و جلسات عملی برگزار خواهد شد.'}
              </p>
            </div>

            {s?.tt_video_url && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border-4 border-slate-100">
                <iframe
                  src={getEmbedUrl(s.tt_video_url)}
                  className="w-full h-full border-none"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                <span>آموزش روش‌های نوین تدریس</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                <span>پشتیبانی و جلسات رفع اشکال</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                <span>اعطای گواهی معتبر پایان دوره</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-deep to-teal text-white p-6 sm:p-8 rounded-2xl text-center flex flex-col items-center gap-3 shadow-sm">
              <h3 className="text-lg sm:text-xl font-black">
                {s?.tt_card2_btn_title || 'ثبت‌نام و رزرو ظرفیت'}
              </h3>
              <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed">
                {s?.tt_card2_btn_desc || 'ظرفیت این دوره محدود است. برای رزرو و پیش‌ثبت‌نام، از طریق آیدی زیر در پیام‌رسان‌ها با ما در ارتباط باشید.'}
              </p>
              <div className="bg-white/20 px-6 py-2.5 rounded-xl font-mono text-base font-bold tracking-wider mt-2" dir="ltr">
                {s?.tt_card2_btn_id || '@yar_avali_ha'}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
