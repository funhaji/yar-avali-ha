import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SettingsManager } from '@/components/admin/SettingsManager'
import { requireAdmin } from '@/lib/teachers'
import { getAllSettings } from '@/lib/settings'

export default async function AdminSettingsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const settings = await getAllSettings()

  return (
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><Settings /> تنظیمات سایت</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>مدیریت تنظیمات و محتوای صفحه اصلی</h1>
        <SettingsManager initialSettings={settings} />
      </main>
    </div>
  )
}
