import { redirect } from 'next/navigation'
import { Image } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SliderManager } from '@/components/admin/SliderManager'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'

async function getSlides() {
  try {
    return await query('SELECT * FROM yar_homepage_slides ORDER BY display_order ASC, created_at DESC')
  } catch (error) {
    console.error('Slides table not found:', error)
    // Return empty array if table doesn't exist yet
    return []
  }
}

export default async function AdminSliderPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const slides = await getSlides()

  return (
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section">
        <span className="section-kicker"><Image /> اسلایدر صفحه اصلی</span>
        <h1 className="section-title" style={{ marginBottom: '1.6rem' }}>مدیریت اسلایدر داشبورد</h1>
        <SliderManager initialSlides={slides} />
      </main>
    </div>
  )
}
