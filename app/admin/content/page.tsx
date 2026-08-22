import { redirect } from 'next/navigation'
import { FileVideo } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { ContentManager } from '@/components/admin/ContentManager'
import { getAllContentItems } from '@/lib/content'
import { requireAdmin } from '@/lib/teachers'

export default async function AdminContentPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const items = await getAllContentItems()

  return (
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><FileVideo /> مدیریت محتوا</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>ویدیوها و درس‌ها را بساز</h1>
        <ContentManager initialItems={items} />
      </main>
    </div>
  )
}
