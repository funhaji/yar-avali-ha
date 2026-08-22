import { cookies } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { WorksheetsContent } from '@/components/WorksheetsContent'
import { getSettings } from '@/lib/settings'
import { SiteHeader } from '@/components/SiteHeader'

import { getCachedContent, getCachedSettings } from '@/lib/cache'

async function getWorksheets(userId?: string, searchQuery?: string) {
  const hasSubscription = userId ? await hasActiveSubscription(userId) : false
  
  // Get all content from cache
  const allCached = await getCachedContent()
  
  // Filter for pdf and image
  let content = allCached.filter(item => item.content_type === 'pdf' || item.content_type === 'image')
  
  // Apply search filter if provided
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase()
    content = content.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    )
  }
  
  // Sort
  content = content.sort((a, b) => {
    const gA = a.grade_level || ''
    const gB = b.grade_level || ''
    if (gA !== gB) return gA.localeCompare(gB)
    const cA = a.category || ''
    const cB = b.category || ''
    if (cA !== cB) return cA.localeCompare(cB)
    return (a.title || '').localeCompare(b.title || '')
  })
  
  // Group by grade level
  const byGrade: Record<string, any[]> = {}
  content.forEach((item: any) => {
    const grade = item.grade_level || 'other'
    if (!byGrade[grade]) {
      byGrade[grade] = []
    }
    byGrade[grade].push(item)
  })
  
  return { content: byGrade, hasSubscription, allContent: content }
}

export default async function WorksheetsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  let user = null;
  if (token) {
    user = await validateSession(token)
  }
  
  const params = await searchParams
  const searchQuery = params.q
  
  const [{ content: byGrade, hasSubscription, allContent }, settings] = await Promise.all([
    getWorksheets(user?.id, searchQuery),
    getCachedSettings(['site_logo_url', 'site_name']),
  ])
  
  const siteName = settings.site_name || 'یار اولی‌ها'
  
  const grades = ['class-1', 'class-2', 'class-3']
  const gradeNames: Record<string, string> = {
    'class-1': 'کلاس اول',
    'class-2': 'کلاس دوم',
    'class-3': 'کلاس سوم'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      <SiteHeader userName={user?.name} isAdmin={user?.role === 'admin'} siteName={siteName} siteLogo={settings.site_logo_url || undefined} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">کاربرگ‌ها و فایل‌های PDF</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            فایل‌های PDF و تصاویر تمرینی برای کلاس‌های اول تا سوم
          </p>
        </div>

        <WorksheetsContent 
          byGrade={byGrade} 
          hasSubscription={hasSubscription}
          initialQuery={searchQuery}
          grades={grades}
          gradeNames={gradeNames}
        />
      </main>
    </div>
  )
}
