export const revalidate = 60

import { Metadata } from 'next'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getSettings } from '@/lib/settings'
import {
  getVisibleTeachers,
  getActiveTutoringGrades,
  getActiveTutoringSubjects
} from '@/lib/teachers'
import { TeacherTrainingClientPage } from '@/components/tutoring/TeacherTrainingClientPage'

export default async function TeacherTrainingPage() {
  const [teachers, grades, subjects, settingsData] = await Promise.all([
    getVisibleTeachers(),
    getActiveTutoringGrades(),
    getActiveTutoringSubjects(),
    getSettings([
      'tt_card1_title', 'tt_card1_desc', 'tt_card1_btn_title', 'tt_card1_btn_desc', 'tt_card1_btn_id',
      'tt_card2_title', 'tt_card2_desc', 'tt_card2_btn_title', 'tt_card2_btn_desc', 'tt_card2_btn_id',
      'site_logo_url', 'site_name', 'footer_text', 'contact_email', 'contact_phone',
      'tt_video_url', 'tt_video_url_2'
    ])
  ])

  const s = (settingsData || {}) as Record<string, string | null>

  return (
    <div className="page bg-slate-50 text-slate-800 flex flex-col min-h-screen">
      <SiteHeader
        siteLogo={s?.site_logo_url || undefined}
        siteName={s?.site_name || undefined}
      />

      <TeacherTrainingClientPage
        teachers={teachers}
        grades={grades}
        subjects={subjects}
        settings={s}
      />

      <SiteFooter
        footerText={s?.footer_text || undefined}
        contactEmail={s?.contact_email || undefined}
        contactPhone={s?.contact_phone || undefined}
        siteName={s?.site_name || undefined}
      />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'معلم خصوصی و دوره تربیت معلم | یار اولی‌ها',
    description: 'انتخاب معلم خصوصی آنلاین و حضوری برای مقطع دبستان و دوره تخصصی تربیت معلم با ارائه مدرک معتبر.',
    alternates: { canonical: 'https://www.yaravaliha.ir/teacher-training' }
  }
}
