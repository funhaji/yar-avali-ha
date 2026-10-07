'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function BlobOptimizer() {
  const [loading, setLoading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleOptimize = async () => {
    if (!confirm('آیا مایلید تصاویر باقیمانده به فرمت فشرده و پرسرعت WebP تبدیل شوند؟ این عملیات به صورت دسته‌ای و امن اجرا می‌شود.')) {
      return
    }

    setLoading(true)
    setResult(null)
    setProgressText('در حال آماده‌سازی و شروع بهینه‌سازی...')

    let totalOptimized = 0
    let totalMB = 0
    let hasMore = true
    let iteration = 0

    try {
      while (hasMore && iteration < 15) {
        iteration++
        setProgressText(`در حال تبدیل تصاویر (مرحله ${iteration})...`)

        const res = await fetch('/api/admin/optimize-blobs', { method: 'POST' })
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'خطا در بهینه‌سازی')
        }

        totalOptimized += data.optimizedCount || 0
        totalMB += parseFloat(data.totalSavedMB || '0')

        if (data.optimizedCount === 0 || !data.hasMore) {
          hasMore = false
          break
        }

        setProgressText(`${totalOptimized} تصویر فشرده شد (${data.remainingCount} تصویر باقیمانده)...`)
      }

      setResult({
        success: true,
        message: totalOptimized > 0
          ? `عملیات با موفقیت پایان یافت! ${totalOptimized} تصویر به فرمت WebP تبدیل شد (${totalMB.toFixed(2)} مگابایت صرفه‌جویی ترافیک).`
          : 'همه تصاویر از قبل بهینه‌سازی شده‌اند و نیازی به تغییر نبود.'
      })
    } catch (err: any) {
      setResult({
        success: false,
        message: 'خطا: ' + err.message
      })
    } finally {
      setLoading(false)
      setProgressText('')
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
        <span>{loading ? (progressText || 'در حال بهینه‌سازی...') : 'بهینه‌سازی تصاویر موجود (WebP)'}</span>
      </button>

      {result && (
        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${result.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
