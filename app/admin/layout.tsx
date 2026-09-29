import { validateSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'پنل مدیریت | یار اولی‌ها',
  robots: 'noindex, nofollow'
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  
  if (!user || user.role !== 'admin') {
    redirect('/')
  }
  
  return (
    <div className="flex min-h-screen bg-cream text-ink w-full max-w-full overflow-x-hidden">
      <AdminSidebar />
      <div className="flex-1 min-w-0 max-w-full overflow-x-hidden pb-20 lg:pb-0">
        {children}
      </div>
    </div>
  )
}
