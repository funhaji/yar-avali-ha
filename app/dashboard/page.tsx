import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'

async function getDashboardData(userId: string) {
  // Get subscription status
  const hasSubscription = await hasActiveSubscription(userId)
  
  // Get recent viewing history
  const history = await query(`
    SELECT vh.*, c.title, c.thumbnail_url, c.duration_seconds, c.content_type
    FROM yar_viewing_history vh
    JOIN yar_content_items c ON vh.content_id = c.id
    WHERE vh.user_id = $1
    ORDER BY vh.last_watched_at DESC
    LIMIT 6
  `, [userId])
  
  // Get continue watching (incomplete items)
  const continueWatching = await query(`
    SELECT vh.*, c.title, c.thumbnail_url, c.duration_seconds, c.content_type
    FROM yar_viewing_history vh
    JOIN yar_content_items c ON vh.content_id = c.id
    WHERE vh.user_id = $1 AND vh.completed = false AND vh.progress_seconds > 0
    ORDER BY vh.last_watched_at DESC
    LIMIT 4
  `, [userId])
  
  return { hasSubscription, history, continueWatching }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  const user = await validateSession(token)
  
  if (!user) {
    redirect('/login')
  }
  
  const { hasSubscription, history, continueWatching } = await getDashboardData(user.id)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              یار اولی‌ها
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-purple-600 font-medium">داشبورد</Link>
              <Link href="/curriculum" className="text-gray-700 hover:text-purple-600">آموزش</Link>
              <Link href="/entertainment" className="text-gray-700 hover:text-purple-600">سرگرمی</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">سلام، {user.name}</span>
            <Link href="/profile" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              پروفایل
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome & Subscription Status */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">خوش آمدید!</h1>
          
          {!hasSubscription ? (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-2">🎁 اشتراک ویژه را تجربه کنید</h2>
              <p className="mb-4">با خرید اشتراک به تمام محتوای آموزشی و سرگرمی دسترسی داشته باشید</p>
              <Link href="/subscription" className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
                مشاهده طرح‌های اشتراک
              </Link>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <div>
                  <h2 className="text-xl font-bold">اشتراک فعال</h2>
                  <p>شما به تمام محتوای پلتفرم دسترسی دارید</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ادامه تماشا</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {continueWatching.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/watch/${item.content_id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={item.thumbnail_url || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                      <div
                        className="h-full bg-purple-600"
                        style={{
                          width: `${(item.progress_seconds / item.duration_seconds) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      {Math.floor(item.progress_seconds / 60)} از {Math.floor(item.duration_seconds / 60)} دقیقه
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Access */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">دسترسی سریع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/curriculum"
              className="bg-gradient-to-br from-pink-400 to-red-400 p-8 rounded-xl text-white hover:scale-105 transition-transform"
            >
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">محتوای درسی</h3>
              <p>ریاضی، فارسی، علوم و بیشتر</p>
            </Link>
            
            <Link
              href="/entertainment"
              className="bg-gradient-to-br from-purple-400 to-blue-400 p-8 rounded-xl text-white hover:scale-105 transition-transform"
            >
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold mb-2">سرگرمی</h3>
              <p>انیمه‌ها و فیلم‌های کودکانه</p>
            </Link>
          </div>
        </section>

        {/* Recent History */}
        {history.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">تاریخچه بازدید</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {history.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/watch/${item.content_id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.thumbnail_url || '/placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
