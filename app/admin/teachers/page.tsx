import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { getAllTeachers, requireAdmin } from '@/lib/teachers'
import { AdminTutoringPanel } from '@/components/admin/AdminTutoringPanel'

export default async function AdminTeachersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')
  const teachers = await getAllTeachers()

  return (
    <div className="page bg-slate-50 min-h-screen text-slate-800">
      <header className="site-header bg-white border-b border-slate-200">
        <nav className="site-nav max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="brand flex items-center gap-2 font-black text-slate-900">
            <span className="brand-mark bg-teal text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold">۱</span>
            <span>پنل مدیریت یار اولی‌ها</span>
          </Link>
          <Link href="/admin" className="button button-ghost text-xs flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" /> بازگشت به داشبورد
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>مدیریت اساتید و تدریس خصوصی</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            اساتید، پایه‌ها و درخواست‌های تدریس
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تنظیم پروفایل معلمان، دوره‌ها، تعریف پایه‌ها و دروس، و بررسی درخواست‌های ثبت‌شده توسط دانش‌آموزان
          </p>
        </div>

        <AdminTutoringPanel initialTeachers={teachers} />
      </main>
    </div>
  )
}
