import { redirect } from 'next/navigation'
import { HeartHandshake } from 'lucide-react'
import { getAllTeachers, requireAdmin } from '@/lib/teachers'
import { TeacherManager } from '@/components/TeacherManager'
import { SiteHeader } from '@/components/SiteHeader'

export default async function AdminTeachersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')
  const teachers = await getAllTeachers()

  return (
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><HeartHandshake /> مدیریت معلم‌ها</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>معلم‌های صفحه اصلی</h1>
        <TeacherManager initial={teachers} />
      </main>
    </div>
  )
}
