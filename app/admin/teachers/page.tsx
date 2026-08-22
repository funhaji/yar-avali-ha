import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, HeartHandshake } from 'lucide-react'
import { getAllTeachers, requireAdmin } from '@/lib/teachers'
import { TeacherManager } from '@/components/TeacherManager'

export default async function AdminTeachersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')
  const teachers = await getAllTeachers()

  return (
    <div className="page">
      <header className="site-header">
        <nav className="site-nav">
          <Link href="/admin" className="brand"><span className="brand-mark">۱</span><span>پنل مدیریت</span></Link>
          <Link href="/admin" className="button button-ghost"><ArrowRight /> بازگشت به پنل</Link>
        </nav>
      </header>
      <main className="shell section">
        <span className="section-kicker"><HeartHandshake /> مدیریت معلم‌ها</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>معلم‌های صفحه اصلی</h1>
        <TeacherManager initial={teachers} />
      </main>
    </div>
  )
}
