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
    <div className="page bg-slate-100/90 min-h-screen text-slate-900">
      <header className="site-header bg-white border-b-2 border-slate-300 shadow-xs">
        <nav className="site-nav max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/admin" className="brand flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
            <span className="brand-mark bg-teal text-white w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shadow-xs">۱</span>
            <span className="truncate">پنل مدیریت</span>
          </Link>
          <Link href="/admin" className="button button-ghost text-xs flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 border-2 border-slate-300 hover:border-slate-400 bg-white shrink-0">
            <ArrowRight className="w-3.5 h-3.5" /> <span className="hidden xs:inline">بازگشت به داشبورد</span><span className="xs:hidden">داشبورد</span>
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 w-full max-w-full">
        <div className="mb-6 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-300 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal/10 text-teal-800 border border-teal/30 text-xs font-black mb-2.5">
            <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
            <span>مدیریت اساتید و تدریس خصوصی</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            اساتید، پایه‌ها و درخواست‌های تدریس
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            تنظیم پروفایل معلمان، دوره‌ها، تعریف پایه‌ها و دروس، و بررسی درخواست‌های ثبت‌شده توسط دانش‌آموزان
          </p>
        </div>

        <AdminTutoringPanel initialTeachers={teachers} />
      </main>
    </div>
  )
}
