import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Users, UserCheck } from 'lucide-react'
import { AdminUserManager } from '@/components/admin/AdminUserManager'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/teachers'

type AdminUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  active_subscription_until: string | null
}

async function getUsers() {
  return query<AdminUser>(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.role,
      u.created_at,
      MAX(s.end_date) FILTER (WHERE s.end_date > NOW()) AS active_subscription_until
    FROM yar_users u
    LEFT JOIN yar_subscriptions s ON s.user_id = u.id
    GROUP BY u.id
    ORDER BY
      CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END,
      u.created_at DESC
  `)
}

export default async function AdminUsersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const users = await getUsers()

  return (
    <div className="page bg-slate-100/90 min-h-screen text-slate-900">
      <header className="site-header bg-white border-b-2 border-slate-300 shadow-xs">
        <nav className="site-nav max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="brand flex items-center gap-2 font-black text-slate-900">
            <span className="brand-mark bg-teal text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-xs">۱</span>
            <span>پنل مدیریت یار اولی‌ها</span>
          </Link>
          <Link href="/admin" className="button button-ghost text-xs flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 border-2 border-slate-300 hover:border-slate-400 bg-white">
            <ArrowRight className="w-4 h-4" /> بازگشت به داشبورد
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal/10 text-teal-800 border border-teal/30 text-xs font-black mb-3">
            <Users className="w-4 h-4 text-teal-700" />
            <span>مدیریت کاربران و دسترسی‌ها</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            مدیریت کاربران و ادمین‌های سایت
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
            جستجو در بین تمامی کاربران بر اساس نام، نام خانوادگی، ایمیل، شماره تلفن و شناسه، مشاهده وضعیت اشتراک، و مدیریت نقش‌های دسترسی ادمین
          </p>
        </div>

        <AdminUserManager initialUsers={users} />
      </main>
    </div>
  )
}
