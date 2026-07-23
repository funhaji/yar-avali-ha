import { headers } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'

async function getAdminStats() {
  // Total users
  const users = await query('SELECT COUNT(*) as count FROM users')
  const totalUsers = users[0]?.count || 0
  
  // Active subscriptions
  const subs = await query(`
    SELECT COUNT(*) as count 
    FROM subscriptions 
    WHERE end_date > NOW()
  `)
  const activeSubs = subs[0]?.count || 0
  
  // Total content
  const content = await query('SELECT COUNT(*) as count FROM content_items WHERE published = true')
  const totalContent = content[0]?.count || 0
  
  // Recent content
  const recentContent = await query(`
    SELECT id, title, content_type, created_at, view_count
    FROM content_items
    ORDER BY created_at DESC
    LIMIT 5
  `)
  
  // Recent subscription links
  const recentLinks = await query(`
    SELECT id, code, expires_at, max_redemptions, current_redemptions, created_at
    FROM subscription_links
    ORDER BY created_at DESC
    LIMIT 5
  `)
  
  return {
    totalUsers,
    activeSubs,
    totalContent,
    recentContent,
    recentLinks
  }
}

export default async function AdminPage() {
  const headersList = await headers()
  const userRole = headersList.get('x-user-role')
  
  if (userRole !== 'admin') {
    redirect('/')
  }
  
  const stats = await getAdminStats()
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-2xl font-bold text-purple-600">
              پنل مدیریت
            </Link>
            <div className="flex gap-6">
              <Link href="/admin" className="text-purple-600 font-medium">داشبورد</Link>
              <Link href="/admin/content" className="text-gray-700 hover:text-purple-600">محتوا</Link>
              <Link href="/admin/subscriptions" className="text-gray-700 hover:text-purple-600">اشتراک‌ها</Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-purple-600">کاربران</Link>
              <Link href="/admin/store" className="text-gray-700 hover:text-purple-600">فروشگاه</Link>
            </div>
          </div>
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            بازگشت به سایت
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">خوش آمدید به پنل مدیریت</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">کاربران</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="text-5xl text-blue-500">👥</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">اشتراک‌های فعال</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeSubs}</p>
              </div>
              <div className="text-5xl text-green-500">✓</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">محتوای منتشر شده</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalContent}</p>
              </div>
              <div className="text-5xl text-purple-500">📚</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            href="/admin/content/new"
            className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-xl hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-xl font-bold">افزودن محتوا</h3>
            <p className="text-sm text-purple-100">آپلود ویدیو، کاربرگ، و بیشتر</p>
          </Link>
          
          <Link
            href="/admin/subscriptions/new"
            className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="text-xl font-bold">ساخت لینک اشتراک</h3>
            <p className="text-sm text-green-100">ایجاد کد اشتراک جدید</p>
          </Link>
          
          <Link
            href="/admin/users"
            className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold">مدیریت کاربران</h3>
            <p className="text-sm text-blue-100">مشاهده و ویرایش کاربران</p>
          </Link>
          
          <Link
            href="/admin/store"
            className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-xl hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">🛍️</div>
            <h3 className="text-xl font-bold">مدیریت فروشگاه</h3>
            <p className="text-sm text-orange-100">کالاها و سفارشات</p>
          </Link>
        </div>

        {/* Recent Content */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">محتوای اخیر</h2>
            <Link href="/admin/content" className="text-purple-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentContent.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">
                    {item.content_type} • {new Date(item.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{item.view_count} بازدید</span>
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    ویرایش
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Subscription Links */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">لینک‌های اشتراک اخیر</h2>
            <Link href="/admin/subscriptions" className="text-purple-600 hover:underline">
              مشاهده همه
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentLinks.map((link: any) => {
              const isExpired = new Date(link.expires_at) < new Date()
              const isFull = link.current_redemptions >= link.max_redemptions
              
              return (
                <div key={link.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="font-medium text-gray-800 font-mono">{link.code}</h3>
                    <p className="text-sm text-gray-600">
                      {link.current_redemptions} / {link.max_redemptions} استفاده
                      {isExpired && <span className="text-red-600 mr-2">• منقضی شده</span>}
                      {isFull && <span className="text-orange-600 mr-2">• تکمیل شده</span>}
                    </p>
                  </div>
                  <Link
                    href={`/admin/subscriptions/${link.id}`}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    جزئیات
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
