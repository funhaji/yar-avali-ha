import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'

async function getEntertainmentContent(userId: string) {
  const hasSubscription = await hasActiveSubscription(userId)
  
  // Get all anime series (grouped by series_title)
  const series = await query(`
    SELECT DISTINCT series_title, 
           MIN(thumbnail_url) as thumbnail_url,
           MIN(genre) as genre,
           MIN(age_tag) as age_tag,
           COUNT(*) as episode_count
    FROM content_items
    WHERE content_type = 'anime' 
      AND series_title IS NOT NULL
      AND published = true
    GROUP BY series_title
    ORDER BY series_title
  `)
  
  // Get standalone movies
  const movies = await query(`
    SELECT * FROM content_items
    WHERE content_type = 'movie'
      AND published = true
    ORDER BY created_at DESC
  `)
  
  return { series, movies, hasSubscription }
}

export default async function EntertainmentPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">لطفاً وارد شوید</h1>
          <Link href="/login" className="text-purple-600 hover:underline">
            ورود به حساب کاربری
          </Link>
        </div>
      </div>
    )
  }
  
  const { series, movies, hasSubscription } = await getEntertainmentContent(userId)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-purple-400">
              یار اولی‌ها
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-white">داشبورد</Link>
              <Link href="/curriculum" className="text-gray-300 hover:text-white">آموزش</Link>
              <Link href="/entertainment" className="text-purple-400 font-medium">سرگرمی</Link>
              <Link href="/store" className="text-gray-300 hover:text-white">فروشگاه</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-12">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-5xl font-bold mb-4">کتابخانه سرگرمی</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            انیمه‌ها و فیلم‌های کودکانه با محتوای مناسب سن
          </p>
        </div>

        {!hasSubscription && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl mb-12">
            <h2 className="text-xl font-bold mb-2">
              🎁 تمام فیلم‌ها و انیمه‌ها را با اشتراک ببینید
            </h2>
            <p className="mb-4 text-purple-100">
              بدون محدودیت، بدون وقفه - تجربه‌ای کامل برای کودک شما
            </p>
            <Link href="/subscription" className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
              خرید اشتراک
            </Link>
          </div>
        )}

        {/* Anime Series */}
        {series.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📺</span>
              سریال‌های انیمه
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {series.map((item: any) => (
                <Link
                  key={item.series_title}
                  href={`/series/${encodeURIComponent(item.series_title)}`}
                  className="group"
                >
                  <div className="relative rounded-lg overflow-hidden mb-3 aspect-[2/3] bg-gray-800">
                    <img
                      src={item.thumbnail_url || '/placeholder.jpg'}
                      alt={item.series_title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 text-sm">
                          {item.age_tag && (
                            <span className="bg-purple-600 px-2 py-1 rounded text-xs">
                              {item.age_tag}
                            </span>
                          )}
                          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                            {item.episode_count} قسمت
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold group-hover:text-purple-400 transition-colors">
                    {item.series_title}
                  </h3>
                  {item.genre && (
                    <p className="text-sm text-gray-400">{item.genre}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Movies */}
        {movies.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🎞️</span>
              فیلم‌ها
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {movies.map((item: any) => {
                const isLocked = item.tier_requirement !== 'free' && !hasSubscription
                
                return (
                  <div key={item.id} className="group">
                    <Link href={isLocked ? '/subscription' : `/watch/${item.id}`}>
                      <div className="relative rounded-lg overflow-hidden mb-3 aspect-[2/3] bg-gray-800">
                        <img
                          src={item.thumbnail_url || '/placeholder.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🔒</div>
                              <div className="text-sm">نیاز به اشتراک</div>
                            </div>
                          </div>
                        )}
                        {item.tier_requirement === 'free' && (
                          <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-xs font-medium">
                            رایگان
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center gap-2 text-sm">
                              {item.age_tag && (
                                <span className="bg-purple-600 px-2 py-1 rounded text-xs">
                                  {item.age_tag}
                                </span>
                              )}
                              {item.duration_seconds && (
                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                                  {Math.floor(item.duration_seconds / 60)} دقیقه
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-bold group-hover:text-purple-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.genre && (
                        <p className="text-sm text-gray-400">{item.genre}</p>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {series.length === 0 && movies.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold mb-2">به زودی!</h3>
            <p className="text-gray-400">
              محتوای سرگرمی به زودی اضافه خواهد شد
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
