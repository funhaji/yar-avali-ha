import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { generateVideoToken, getWatermarkText } from '@/lib/video'
import VideoPlayer from '@/components/VideoPlayer'

async function getContentData(contentId: string, userId: string) {
  // Get content details
  const content = await query(`
    SELECT * FROM content_items WHERE id = $1 AND published = true
  `, [contentId])
  
  if (content.length === 0) {
    return null
  }
  
  const item = content[0]
  
  // Check access
  let hasAccess = item.tier_requirement === 'free'
  if (!hasAccess) {
    hasAccess = await hasActiveSubscription(userId)
  }
  
  // Get user info for watermark
  const users = await query(`
    SELECT name, phone FROM users WHERE id = $1
  `, [userId])
  
  const user = users[0]
  
  // Get viewing progress
  const progress = await query(`
    SELECT progress_seconds FROM viewing_history 
    WHERE user_id = $1 AND content_id = $2
  `, [userId, contentId])
  
  const lastPosition = progress.length > 0 ? progress[0].progress_seconds : 0
  
  // Generate video token
  const videoToken = generateVideoToken(contentId, userId)
  
  // Get related content (same category or series)
  let related = []
  if (item.series_title) {
    related = await query(`
      SELECT id, title, thumbnail_url, episode_number
      FROM content_items
      WHERE series_title = $1 AND id != $2 AND published = true
      ORDER BY episode_number
      LIMIT 6
    `, [item.series_title, contentId])
  } else if (item.category) {
    related = await query(`
      SELECT id, title, thumbnail_url
      FROM content_items
      WHERE category = $1 AND id != $2 AND published = true
      ORDER BY view_count DESC
      LIMIT 6
    `, [item.category, contentId])
  }
  
  return {
    content: item,
    hasAccess,
    watermark: getWatermarkText(user.name, user.phone),
    lastPosition,
    videoToken,
    related
  }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userName = headersList.get('x-user-name')
  
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
  
  const data = await getContentData(id, userId)
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">محتوا یافت نشد</h1>
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    )
  }
  
  const { content, hasAccess, watermark, lastPosition, videoToken, related } = data
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-white hover:text-purple-400 flex items-center gap-2">
            <span>←</span>
            <span>بازگشت</span>
          </Link>
          <span className="text-white">{userName}</span>
        </nav>
      </header>

      {!hasAccess ? (
        // Access denied - show upgrade prompt
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-gray-900 rounded-xl p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              این محتوا نیاز به اشتراک دارد
            </h1>
            <p className="text-gray-300 mb-6">
              برای تماشای این ویدیو و دسترسی به تمام محتوای پلتفرم، اشتراک تهیه کنید
            </p>
            <Link
              href="/subscription"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700"
            >
              خرید اشتراک
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Video Player */}
          <div className="container mx-auto">
            <VideoPlayer
              contentId={id}
              videoToken={videoToken}
              watermark={watermark}
              startPosition={lastPosition}
              title={content.title}
            />
          </div>

          {/* Content Info */}
          <div className="container mx-auto px-4 py-8">
            <div className="bg-gray-900 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{content.title}</h1>
              {content.series_title && (
                <p className="text-purple-400 mb-2">
                  {content.series_title} - قسمت {content.episode_number}
                </p>
              )}
              <p className="text-gray-300 mb-4">{content.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {content.category && (
                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    {content.category}
                  </span>
                )}
                {content.age_tag && (
                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    {content.age_tag}
                  </span>
                )}
                {content.duration_seconds && (
                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    {Math.floor(content.duration_seconds / 60)} دقیقه
                  </span>
                )}
              </div>
            </div>

            {/* Related Content */}
            {related.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {content.series_title ? 'قسمت‌های دیگر' : 'محتوای مرتبط'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {related.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/watch/${item.id}`}
                      className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                    >
                      <img
                        src={item.thumbnail_url || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="text-white text-sm font-medium truncate">
                          {item.episode_number && `${item.episode_number}. `}
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
