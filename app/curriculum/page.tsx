import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { CurriculumContent } from '@/components/CurriculumContent'
import { getSettings } from '@/lib/settings'

async function getCurriculumContent(userId: string, searchQuery?: string) {
  const hasSubscription = await hasActiveSubscription(userId)
  
  // Get curriculum content (lessons and reading only, no worksheets)
  let sql = `
    SELECT * FROM yar_content_items
    WHERE content_type IN ('lesson', 'reading')
      AND published = true
  `
  
  const params: any[] = []
  
  // Add search filter if query provided
  if (searchQuery && searchQuery.trim()) {
    sql += ` AND (
      LOWER(title) LIKE LOWER($1) OR 
      LOWER(description) LIKE LOWER($1) OR
      LOWER(category) LIKE LOWER($1)
    )`
    params.push(`%${searchQuery.trim()}%`)
  }
  
  sql += ' ORDER BY grade_level, category, title'
  
  const content = await query(sql, params.length > 0 ? params : undefined)
  
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

export default async function CurriculumPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  const user = await validateSession(token)
  
  if (!user) {
    redirect('/login')
  }
  
  const params = await searchParams
  const searchQuery = params.q
  
  const [{ content: byGrade, hasSubscription, allContent }, settings] = await Promise.all([
    getCurriculumContent(user.id, searchQuery),
    getSettings(['site_logo_url', 'site_name']),
  ])
  
  const siteName = settings.site_name || 'یار اولی‌ها'
  
  const grades = ['class-1', 'class-2', 'class-3']
  const gradeNames: Record<string, string> = {
    'class-1': 'کلاس اول',
    'class-2': 'کلاس دوم',
    'class-3': 'کلاس سوم'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              {siteName}
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-purple-600">داشبورد</Link>
              <Link href="/curriculum" className="text-purple-600 font-medium">آموزش</Link>
              <Link href="/worksheets" className="text-gray-700 hover:text-purple-600">کاربرگ‌ها</Link>
              <Link href="/entertainment" className="text-gray-700 hover:text-purple-600">سرگرمی</Link>
              <Link href="/store" className="text-gray-700 hover:text-purple-600">فروشگاه</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">محتوای درسی</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            درس‌ها و روان‌خوانی برای کلاس‌های اول تا سوم
          </p>
        </div>

        {/* Search Bar */}
        <CurriculumContent 
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
