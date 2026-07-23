import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'

async function getCurriculumContent(userId: string) {
  const hasSubscription = await hasActiveSubscription(userId)
  
  // Get all curriculum content grouped by grade
  const content = await query(`
    SELECT * FROM yar_content_items
    WHERE content_type IN ('lesson', 'worksheet', 'reading')
      AND published = true
    ORDER BY grade_level, category, title
  `)
  
  // Group by grade level
  const byGrade: Record<string, any[]> = {}
  content.forEach((item: any) => {
    const grade = item.grade_level || 'other'
    if (!byGrade[grade]) {
      byGrade[grade] = []
    }
    byGrade[grade].push(item)
  })
  
  return { content: byGrade, hasSubscription }
}

export default async function CurriculumPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  const user = await validateSession(token)
  
  if (!user) {
    redirect('/login')
  }
  
  const { content: byGrade, hasSubscription } = await getCurriculumContent(user.id)
  
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
              یار اولی‌ها
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-purple-600">داشبورد</Link>
              <Link href="/curriculum" className="text-purple-600 font-medium">آموزش</Link>
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
            درس‌ها، کاربرگ‌ها و روان‌خوانی برای کلاس‌های اول تا سوم
          </p>
        </div>

        {!hasSubscription && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold mb-2">
              🎁 با اشتراک ویژه به همه دسترسی داشته باشید
            </h2>
            <p className="mb-4">
              فقط محتوای رایگان را می‌بینید. با خرید اشتراک به تمام درس‌ها دسترسی پیدا کنید
            </p>
            <Link href="/subscription" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
              خرید اشتراک
            </Link>
          </div>
        )}

        {/* Content by Grade */}
        {grades.map(grade => (
          <section key={grade} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="bg-pink-400 text-white w-12 h-12 rounded-full flex items-center justify-center">
                {grade.split('-')[1]}
              </span>
              {gradeNames[grade]}
            </h2>
            
            {byGrade[grade] && byGrade[grade].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {byGrade[grade].map((item: any) => {
                  const isLocked = item.tier_requirement !== 'free' && !hasSubscription
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={item.thumbnail_url || '/placeholder.jpg'}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="text-4xl mb-2">🔒</div>
                              <div className="text-sm">نیاز به اشتراک</div>
                            </div>
                          </div>
                        )}
                        {item.tier_requirement === 'free' && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            رایگان
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {item.category && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {item.content_type === 'reading' && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                              روان‌خوانی
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {isLocked ? (
                          <Link
                            href="/subscription"
                            className="block w-full text-center py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            خرید اشتراک
                          </Link>
                        ) : (
                          <Link
                            href={`/watch/${item.id}`}
                            className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            مشاهده
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                محتوایی برای این پایه موجود نیست
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}
