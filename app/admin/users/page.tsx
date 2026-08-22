import { redirect } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
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
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><UserPlus /> مدیریت ادمین‌ها</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>ادمین اضافه کن</h1>
        <AdminUserManager initialUsers={users} />
      </main>
    </div>
  )
}
