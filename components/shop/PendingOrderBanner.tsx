'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Clock, CreditCard, ArrowLeft, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import type { OrderDetail } from '@/lib/orders'

export function PendingOrderBanner({ order }: { order: OrderDetail }) {
  const [visible, setVisible] = useState(true)
  const [paying, setPaying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!visible) return null

  const remainingHours = order.remaining_hours || 0
  const remainingDays = Math.floor(remainingHours / 24)
  const remainingHoursMod = remainingHours % 24

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await fetch(`/api/store/orders/${order.id}/pay`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert(data.error || 'خطا در هدایت به درگاه پرداخت')
      }
    } catch {
      alert('خطای ارتباط با سرور')
    } finally {
      setPaying(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('آیا از لغو این سفارش در انتظار اطمینان دارید؟')) return

    setCancelling(true)
    try {
      const res = await fetch(`/api/store/orders/${order.id}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMessage('سفارش با موفقیت لغو شد.')
        setTimeout(() => setVisible(false), 2000)
      } else {
        alert(data.error || 'خطا در لغو سفارش')
      }
    } catch {
      alert('خطای ارتباط با سرور')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="mb-8 p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-2 border-amber-400 shadow-lg shadow-amber-500/10 slide-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base md:text-lg font-black text-amber-950">
                شما یک سفارش در انتظار پرداخت دارید!
              </h3>
              <span className="badge bg-amber-200 text-amber-900 border-amber-300 text-xs font-bold font-mono" dir="ltr">
                #{order.id.slice(0, 8)}
              </span>
            </div>
            <p className="text-xs md:text-sm text-amber-900/80 leading-relaxed">
              سفارشی شامل {order.items.length} کالا به مبلغ{' '}
              <b className="text-amber-950 font-black">{(order.total_cents / 10).toLocaleString()} تومان</b>{' '}
              منتظر نهایی‌سازی پرداخت است.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 pt-1">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>
                مهلت پرداخت: {remainingDays > 0 ? `${remainingDays} روز و ` : ''}{remainingHoursMod} ساعت باقی‌مانده (حذف خودکار پس از ۳ روز)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {message ? (
            <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </span>
          ) : (
            <>
              {order.status === 'pending_payment' && (
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="button bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg py-2.5 px-4 text-xs md:text-sm font-bold rounded-xl flex items-center gap-1.5"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  <span>پرداخت آنلاین</span>
                </button>
              )}

              <Link
                href="/dashboard#orders"
                className="button button-ghost border border-amber-300/80 bg-white/80 hover:bg-white text-amber-950 py-2.5 px-4 text-xs md:text-sm font-bold rounded-xl flex items-center gap-1.5"
              >
                <span>مشاهده در پیشخوان</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="button button-ghost border border-red-200 text-red-700 hover:bg-red-50 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center gap-1"
                title="لغو این سفارش"
              >
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>لغو</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
