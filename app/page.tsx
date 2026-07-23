import Link from 'next/link'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  const user = token ? await validateSession(token) : null
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Header / Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              یار اولی‌ها
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/curriculum" className="text-gray-700 hover:text-purple-600">آموزش</Link>
              <Link href="/entertainment" className="text-gray-700 hover:text-purple-600">سرگرمی</Link>
              <Link href="/teachers" className="text-gray-700 hover:text-purple-600">همکاری معلمان</Link>
              <Link href="/workshops" className="text-gray-700 hover:text-purple-600">کارگاه‌ها</Link>
              <Link href="/blog" className="text-gray-700 hover:text-purple-600">بلاگ</Link>
              <Link href="/about" className="text-gray-700 hover:text-purple-600">درباره ما</Link>
              <Link href="/contact" className="text-gray-700 hover:text-purple-600">تماس</Link>
            </div>
          </div>
          <div className="flex gap-4">
            {user ? (
              <>
                <span className="px-4 py-2 text-gray-700">سلام، {user.name}</span>
                <Link href="/dashboard" className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg">
                  داشبورد
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                  ورود
                </Link>
                <Link href="/register" className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg">
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          دنیای یادگیری و سرگرمی کودکان
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          محتوای آموزشی با کیفیت برای پیش‌دبستانی و کلاس اول همراه با انیمه‌ها و فیلم‌های سرگرم‌کننده
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-purple-600 text-white text-lg rounded-lg hover:bg-purple-700">
            شروع رایگان
          </Link>
          <Link href="/subscription" className="px-8 py-4 bg-white text-purple-600 text-lg rounded-lg border-2 border-purple-600 hover:bg-purple-50">
            مشاهده اشتراک‌ها
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">محتوای درسی</h3>
            <p className="text-gray-600">
              درس‌های ریاضی، فارسی، علوم و روان‌خوانی برای کلاس‌های اول، دوم و سوم
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">انیمه و فیلم</h3>
            <p className="text-gray-600">
              کتابخانه‌ای از سریال‌های انیمه و فیلم‌های کودکانه مناسب با سن
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-2">فروشگاه</h3>
            <p className="text-gray-600">
              لوازم‌التحریر، قالب‌های پاورپوینت و محصولات دیجیتال آموزشی
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">طرح‌های اشتراک</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-4">اشتراک رایگان</h3>
            <div className="text-3xl font-bold text-gray-800 mb-6">رایگان</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                دسترسی به محتوای رایگان
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                فیلترینگ بر اساس سن
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">✗</span>
                دسترسی به همه محتوا
              </li>
            </ul>
            <Link href="/register" className="block w-full py-3 text-center bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              ثبت‌نام رایگان
            </Link>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8 rounded-xl shadow-lg border-2 border-purple-700">
            <div className="inline-block bg-yellow-400 text-purple-900 text-sm font-bold px-3 py-1 rounded-full mb-2">
              محبوب
            </div>
            <h3 className="text-2xl font-bold mb-4">اشتراک ویژه</h3>
            <div className="text-3xl font-bold mb-6">۶ ماهه</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                دسترسی کامل به تمام محتوا
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                بدون محدودیت تماشا
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                محتوای درسی و سرگرمی
              </li>
            </ul>
            <Link href="/subscription" className="block w-full py-3 text-center bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100">
              خرید اشتراک
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">یار اولی‌ها</h4>
              <p className="text-gray-400">
                پلتفرم آموزشی و سرگرمی برای کودکان پیش‌دبستانی و ابتدایی
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">دسترسی سریع</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/curriculum" className="hover:text-white">محتوای درسی</Link></li>
                <li><Link href="/entertainment" className="hover:text-white">سرگرمی</Link></li>
                <li><Link href="/store" className="hover:text-white">فروشگاه</Link></li>
                <li><Link href="/subscription" className="hover:text-white">خرید اشتراک</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">اطلاعات</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">درباره ما</Link></li>
                <li><Link href="/teachers" className="hover:text-white">همکاری معلمان</Link></li>
                <li><Link href="/blog" className="hover:text-white">بلاگ</Link></li>
                <li><Link href="/contact" className="hover:text-white">تماس با ما</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">تماس با ما</h4>
              <ul className="space-y-2 text-gray-400">
                <li>ایمیل: info@yaravaliha.com</li>
                <li>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© ۱۴۰۳ یار اولی‌ها. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
