import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'

async function getSeriesEpisodes(seriesName: string, userId: string) {
  const hasSubscription = await hasActiveSubscription(userId)
  
  const episodes = await query(`
    SELECT * FROM yar_content_items
    WHERE series_title = $1 AND published = true
    ORDER BY episode_number ASC
  `, [seriesName])
  
  return { episodes, hasSubscription }
}

export default async function SeriesPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const seriesName = decodeURIComponent(name)
  
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  const user = await validateSession(token)
  
  if (!user) {
    redirect('/login')
  }
  
  const [{ episodes, hasSubscription }, settings] = await Promise.all([
    getSeriesEpisodes(seriesName, user.id),
    getSettings(['site_logo_url', 'site_name']),
  ])
  
  const siteName = settings.site_name || 'یار اولی‌ها'
  
  if (episodes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">سریال یافت نشد</h1>
          <Link href="/entertainment" className="text-purple-400 hover:underline">
            بازگشت به کتابخانه سرگرمی
          </Link>
        </div>
      </div>
    )
  }
  
  const firstEpisode = episodes[0]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-purple-400">
              {siteName}
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-white">داشبورد</Link>
              <Link href="/curriculum" className="text-gray-300 hover:text-white">آموزش</Link>
              <Link href="/entertainment" className="text-purple-400 font-medium">سرگرمی</Link>
            </div>
          </div>
          <span className="text-white">{user.name}</span>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Series Header */}
        <div className="mb-12">
          <Link href="/entertainment" className="text-purple-400 hover:underline mb-4 inline-block">
            ← بازگشت به کتابخانه
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0">
              <img
                src={firstEpisode.thumbnail_url || '/placeholder.jpg'}
                alt={seriesName}
                className="w-full rounded-lg shadow-lg aspect-[3/4] object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{seriesName}</h1>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {firstEpisode.genre && (
                  <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                    {firstEpisode.genre}
                  </span>
                )}
                {firstEpisode.age_tag && (
                  <span className="bg-pink-600 px-3 py-1 rounded-full text-sm">
                    {firstEpisode.age_tag}
                  </span>
                )}
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {episodes.length} قسمت
                </span>
              </div>
              
              {firstEpisode.description && (
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {firstEpisode.description}
                </p>
              )}
              
              {!hasSubscription && episodes.some((ep: any) => ep.tier_requirement !== 'free') && (
                <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-4 rounded-lg">
                  <p className="text-white font-medium mb-2">
                    🔒 برخی قسمت‌ها نیاز به اشتراک دارند
                  </p>
                  <Link
                    href="/subscription"
                    className="inline-block bg-white text-pink-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                  >
                    خرید اشتراک
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episodes Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">قسمت‌ها</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {episodes.map((episode: any) => {
              const isLocked = episode.tier_requirement !== 'free' && !hasSubscription
              
              return (
                <Link
                  key={episode.id}
                  href={isLocked ? '/subscription' : `/watch/${episode.id}`}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                >
                  <div className="relative aspect-video">
                    <img
                      src={episode.thumbnail_url || '/placeholder.jpg'}
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isLocked && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl mb-1">🔒</div>
                          <div className="text-xs">نیاز به اشتراک</div>
                        </div>
                      </div>
                    )}
                    {episode.tier_requirement === 'free' && (
                      <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-xs font-medium">
                        رایگان
                      </div>
                    )}
                    {episode.duration_seconds && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
                        {Math.floor(episode.duration_seconds / 60)} دقیقه
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {episode.episode_number && (
                        <span className="bg-purple-600 px-2 py-0.5 rounded text-xs font-bold">
                          قسمت {episode.episode_number}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                      {episode.title}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
