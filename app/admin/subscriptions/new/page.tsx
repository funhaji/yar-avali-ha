'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewSubscriptionLinkPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    expiresAt: '',
    maxRedemptions: '1'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ code: string; url: string } | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/subscription-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresAt: new Date(formData.expiresAt).toISOString(),
          maxRedemptions: parseInt(formData.maxRedemptions)
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'خطا در ساخت لینک')
        setLoading(false)
        return
      }
      
      const baseUrl = window.location.origin
      setSuccess({
        code: data.code,
        url: `${baseUrl}/subscription?code=${data.code}`
      })
      setLoading(false)
      
    } catch (err) {
      setError('خطا در برقراری ارتباط')
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm border-b">
          <nav className="container mx-auto px-4 py-4">
            <Link href="/admin" className="text-2xl font-bold text-purple-600">
              پنل مدیریت
            </Link>
          </nav>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  لینک اشتراک ساخته شد!
                </h1>
              </div>
              
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کد اشتراک
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={success.code}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white font-mono text-xl text-center"
                      dir="ltr"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(success.code)}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      کپی
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    لینک مستقیم
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={success.url}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                      dir="ltr"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(success.url)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      کپی
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">راهنمای استفاده:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• کد را برای کاربران ارسال کنید تا در صفحه اشتراک وارد کنند</li>
                    <li>• یا لینک مستقیم را به اشتراک بگذارید</li>
                    <li>• کاربران باید برای استفاده وارد حساب خود شوند</li>
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <Link
                    href="/admin/subscriptions/new"
                    className="flex-1 text-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    onClick={() => setSuccess(null)}
                  >
                    ساخت لینک جدید
                  </Link>
                  <Link
                    href="/admin/subscriptions"
                    className="flex-1 text-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    مشاهده همه لینک‌ها
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-2xl font-bold text-purple-600">
            پنل مدیریت
          </Link>
          <Link href="/admin/subscriptions" className="text-gray-600 hover:text-gray-800">
            بازگشت
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              ساخت لینک اشتراک جدید
            </h1>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  تاریخ انقضا
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  dir="ltr"
                />
                <p className="text-sm text-gray-600 mt-1">
                  لینک بعد از این تاریخ قابل استفاده نخواهد بود
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  تعداد استفاده مجاز
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  حداکثر تعداد کاربرانی که می‌توانند از این لینک استفاده کنند
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">📝 یادداشت:</h3>
                <p className="text-sm text-blue-800">
                  هر کاربر با استفاده از این لینک، ۶ ماه اشتراک فعال دریافت خواهد کرد.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Link
                  href="/admin/subscriptions"
                  className="flex-1 text-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  انصراف
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'در حال ساخت...' : 'ساخت لینک'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
