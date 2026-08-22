import { redirect } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SupportTicketsManager } from '@/components/admin/SupportTicketsManager'
import { requireAdmin } from '@/lib/teachers'

export default async function AdminSupportPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  return (
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><MessageCircle /> پشتیبانی</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>مدیریت تیکت‌های پشتیبانی</h1>
        <SupportTicketsManager />
      </main>
    </div>
  )
}
