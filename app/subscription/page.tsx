'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      // Get user ID from session (in real app, this would come from auth context)
      const response = await fetch('/api/subscription/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'خطا در فعال‌سازی اشتراک')
        setLoading(false)
        return
      }
      
      setSuccess(data.message)
      setLoading(false)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (err) {
      setError('خطا در برقراری ارتباط')
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            یار اولی‌ها
          </Link>
          <Link href="/dashboard" className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg">
            داشبورد
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
            اشتراک یار اولی‌ها
          </h1>

          {/* Subscription Features */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              با اشتراک ۶ ماهه به همه چیز دسترسی داشته باشید
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📚</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">محتوای درسی کامل</h3>
                  <p className="text-gray-600">دسترسی به تمام درس‌های کلاس اول، دوم و سوم</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎬</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">کتابخانه سرگرمی</h3>
                  <p className="text-gray-600">انیمه‌ها و فیلم‌های کودکانه بدون محدودیت</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="text-3xl">📝</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">فایل‌های کاری</h3>
                  <p className="text-gray-600">دانلود و مشاهده فایل‌های تمرینی و روان‌خوانی</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="text-3xl">✨</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">بدون تبلیغات</h3>
                  <p className="text-gray-600">تجربه‌ای بدون وقفه برای یادگیری کودک شما</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="text-center mb-4">
                <span className="text-sm text-purple-600 font-medium">مدت اشتراک</span>
                <div className="text-3xl font-bold text-purple-600 mt-1">۶ ماه</div>
              </div>
              <p className="text-center text-gray-600 mb-4">
                برای دریافت کد اشتراک با پشتیبانی تماس بگیرید
              </p>
            </div>
          </div>

          {/* Redeem Code Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              فعال‌سازی کد اشتراک
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            <form onSubmit={handleRedeem} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  کد اشتراک
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
                  placeholder="XXXX-XXXX-XXXX"
                  required
                  dir="ltr"
                />
                <p className="text-sm text-gray-500 mt-2">
                  کد اشتراک خود را که دریافت کرده‌اید وارد کنید
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال فعال‌سازی...' : 'فعال‌سازی اشتراک'}
              </button>
            </form>
            
            <div className="mt-6 text-center text-gray-600">
              <p>کد اشتراک ندارید؟</p>
              <Link href="/contact" className="text-purple-600 font-medium hover:underline">
                تماس با پشتیبانی
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
