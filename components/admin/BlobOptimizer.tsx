'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function BlobOptimizer() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    savedMB?: string
    count?: number
  } | null>(null)

  const handleOptimize = async () => {
    if (!confirm('آیا مایلید تمام تصاویر موجود در دیتابیس به فرمت فشرده و پرسرعت WebP تبدیل شوند؟ این کار حجم انتقال داده Vercel را به شدت کاهش می‌دهد.')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/optimize-blobs', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          savedMB: data.totalSavedMB,
          count: data.optimizedCount
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'خطا در بهینه‌سازی'
        })
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: 'خطا در برقراری ارتباط با سرور: ' + err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleOptimize}
        disabled={loading}
        className="button px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-300" />
        )}
        <span>{loading ? 'در حال تبدیل و فشرده‌سازی تصاویر...' : 'بهینه‌سازی تصاویر موجود (WebP)'}</span>
      </button>

      {result && (
        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${result.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
