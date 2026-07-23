'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'خطا در ثبت‌نام')
        setLoading(false)
        return
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('خطا در برقراری ارتباط')
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ثبت‌نام در یار اولی‌ها</h1>
          <p className="text-gray-600">حساب کاربری جدید بسازید</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="نام کامل خود را وارد کنید"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              ایمیل
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
              required
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              شماره تلفن (اختیاری)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="09123456789"
              dir="ltr"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              رمز عبور
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="حداقل ۸ کاراکتر"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              باید شامل حروف و اعداد باشد
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              تکرار رمز عبور
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="رمز عبور را دوباره وارد کنید"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              وارد شوید
            </Link>
          </p>
          <Link href="/" className="block text-gray-500 hover:text-gray-700">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  )
}
