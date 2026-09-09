'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShoppingBag, Clock, CheckCircle2, AlertTriangle, XCircle, CreditCard, 
  UploadCloud, Download, Play, Package, MapPin, Phone, Trash2, ArrowRight, 
  ExternalLink, Loader2, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import type { OrderDetail } from '@/lib/orders'

type Props = {
  initialOrders: OrderDetail[]
  adminCard?: { number: string; name: string }
}

export function UserOrdersSection({ initialOrders, adminCard }: Props) {
  const [orders, setOrders] = useState<OrderDetail[]>(initialOrders)
  const pendingOrders = orders.filter(o => o.status === 'pending_payment' || o.status === 'pending_approval')
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'approved' || o.status === 'processing' || o.status === 'shipped')

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>(
    pendingOrders.length > 0 ? 'pending' : completedOrders.length > 0 ? 'completed' : 'all'
  )

  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [uploadingReceiptOrderId, setUploadingReceiptOrderId] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type })
    setTimeout(() => setActionMessage(null), 4000)
  }

  // Handle Order Online Payment (Zarinpal)
  const handleOnlinePay = async (orderId: string) => {
    setPayingOrderId(orderId)
    try {
      const res = await fetch(`/api/store/orders/${orderId}/pay`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        showToast(data.error || 'خطا در ارتباط با درگاه پرداخت', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setPayingOrderId(null)
    }
  }

  // Handle Order Cancellation
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('آیا از لغو این سفارش اطمینان دارید؟')) return

    setCancellingOrderId(orderId)
    try {
      const res = await fetch(`/api/store/orders/${orderId}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
        showToast('سفارش با موفقیت لغو شد.')
      } else {
        showToast(data.error || 'خطا در لغو سفارش', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setCancellingOrderId(null)
    }
  }

  // Handle Card-to-Card Receipt Upload for Pending Order
  const handleUploadReceipt = async (orderId: string, file: File) => {
    setUploadingReceiptOrderId(orderId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', 'receipt')

      const uploadRes = await fetch('/api/store/upload-receipt', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok || !uploadData.url) {
        showToast(uploadData.error || 'خطا در آپلود رسید', 'error')
        return
      }

      // Update order to card2card pending_approval
      const switchRes = await fetch(`/api/store/orders/${orderId}/switch-card2card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_url: uploadData.url })
      })
      const switchData = await switchRes.json()

      if (switchRes.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          status: 'pending_approval',
          payment_method: 'card2card',
          receipt_url: uploadData.url
        } : o))
        showToast('رسید با موفقیت ثبت شد و برای بررسی مدیریت ارسال شد.')
      } else {
        showToast(switchData.error || 'خطا در ثبت رسید', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setUploadingReceiptOrderId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <span className="badge bg-amber-100 text-amber-800 border-amber-300 font-bold"><Clock className="w-3.5 h-3.5 ml-1" /> در انتظار پرداخت</span>
      case 'pending_approval':
        return <span className="badge bg-orange-100 text-orange-800 border-orange-300 font-bold"><Clock className="w-3.5 h-3.5 ml-1" /> در انتظار تایید رسید</span>
      case 'approved':
        return <span className="badge bg-blue-100 text-blue-800 border-blue-300 font-bold"><CheckCircle2 className="w-3.5 h-3.5 ml-1" /> تایید شده</span>
      case 'processing':
        return <span className="badge bg-purple-100 text-purple-800 border-purple-300 font-bold"><Package className="w-3.5 h-3.5 ml-1" /> در حال پردازش و ارسال</span>
      case 'shipped':
        return <span className="badge bg-indigo-100 text-indigo-800 border-indigo-300 font-bold"><Package className="w-3.5 h-3.5 ml-1" /> ارسال شده به پست</span>
      case 'completed':
        return <span className="badge bg-green-100 text-green-800 border-green-300 font-bold"><CheckCircle2 className="w-3.5 h-3.5 ml-1" /> تکمیل شده</span>
      case 'cancelled':
        return <span className="badge bg-gray-100 text-gray-700 border-gray-300"><XCircle className="w-3.5 h-3.5 ml-1" /> لغو شده</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const displayedOrders = activeTab === 'pending'
    ? pendingOrders
    : activeTab === 'completed'
      ? completedOrders
      : orders

  return (
    <section id="orders" className="space-y-6 slide-up scroll-mt-24">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-ink">سفارشات و خریدهای شما</h2>
            <p className="text-xs md:text-sm text-ink-soft">پیگیری سفارشات، دانلود آنی فایل‌های دیجیتال و تکمیل پرداخت</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-cream p-1 rounded-2xl border border-line-soft self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'pending' ? 'bg-white shadow-sm text-amber-700' : 'text-ink-soft hover:text-ink'}`}
          >
            <Clock className="w-4 h-4" />
            <span>در انتظار پرداخت</span>
            {pendingOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'completed' ? 'bg-white shadow-sm text-teal-deep' : 'text-ink-soft hover:text-ink'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>خریدهای موفق</span>
            <span className="badge text-[11px] py-0 px-1.5">{completedOrders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-ink' : 'text-ink-soft hover:text-ink'}`}
          >
            همه ({orders.length})
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 slide-up ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="card p-10 text-center border-dashed bg-paper rounded-3xl">
          <ShoppingBag className="w-12 h-12 text-ink-soft opacity-30 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-ink mb-1">
            {activeTab === 'pending' ? 'هیچ سفارش در انتظار پرداختی ندارید.' : activeTab === 'completed' ? 'هنوز خریدی ثبت نکرده‌اید.' : 'سفارشی یافت نشد.'}
          </h3>
          <p className="text-sm text-ink-soft mb-6">می‌توانید از بخش فروشگاه محصولات آموزشی و کتاب‌ها را مشاهده کنید.</p>
          <Link href="/shop" className="button button-primary inline-flex items-center gap-2">
            ورود به فروشگاه <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map(order => {
            const isPending = order.status === 'pending_payment' || order.status === 'pending_approval'
            const isCompleted = order.status === 'completed' || order.status === 'approved'
            const isExpanded = expandedOrderId === order.id || isPending
            const remainingHours = order.remaining_hours || 0
            const remainingDays = Math.floor(remainingHours / 24)
            const remainingHoursMod = remainingHours % 24

            return (
              <div 
                key={order.id} 
                className={`card p-6 md:p-8 rounded-3xl border transition-all duration-200 bg-paper ${isPending ? 'border-amber-300 shadow-md shadow-amber-500/5 bg-gradient-to-b from-amber-50/20 to-transparent' : 'border-line-soft hover:border-gray-300'}`}
              >
                {/* 3-Day Expiry Warning for Pending Orders */}
                {isPending && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                      <span>
                        مهلت پرداخت: {remainingDays > 0 ? `${remainingDays} روز و ` : ''}{remainingHoursMod} ساعت باقی‌مانده
                      </span>
                    </div>
                    <span className="text-amber-800 text-xs font-normal">
                      سفارش‌های پرداخت‌نشده پس از ۳ روز به طور خودکار حذف خواهند شد.
                    </span>
                  </div>
                )}

                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line-soft">
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="font-mono text-xs text-ink-soft" dir="ltr">
                      # {order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-ink-soft">
                      ثبت شده در: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <span className="text-xs text-ink-soft block">مبلغ کل:</span>
                      <span className="font-black text-lg text-teal-deep">
                        {(order.total_cents / 10).toLocaleString()} تومان
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-5 space-y-4">
                  <div className="text-xs font-bold text-ink-soft mb-2 flex items-center justify-between">
                    <span>اقلام سفارش ({order.items.length} محصول)</span>
                    <button 
                      onClick={() => setExpandedOrderId(isExpanded && !isPending ? null : order.id)}
                      className="text-teal hover:underline flex items-center gap-1 sm:hidden"
                    >
                      {isExpanded ? <><ChevronUp className="w-4 h-4" /> بستن</> : <><ChevronDown className="w-4 h-4" /> جزئیات</>}
                    </button>
                  </div>

                  <div className={`grid gap-3 ${!isExpanded && !isPending ? 'hidden sm:grid' : 'grid'}`}>
                    {order.items.map(item => (
                      <div key={item.id} className="p-4 rounded-2xl bg-cream/40 border border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-paper overflow-hidden border border-line-soft shrink-0 flex items-center justify-center">
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="w-6 h-6 text-ink-soft opacity-30" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-ink line-clamp-1">{item.title}</div>
                            <div className="text-xs text-ink-soft mt-1 flex items-center gap-2">
                              <span>تعداد: {item.quantity} عدد</span>
                              <span>•</span>
                              <span>{(item.price_cents / 10).toLocaleString()} تومان</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Type & Direct Access */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {item.is_digital ? (
                            <span className="badge bg-teal/10 text-teal-deep border-teal/20 text-xs font-bold">
                              ⚡ دیجیتال (آنی)
                            </span>
                          ) : (
                            <span className="badge bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                              📦 فیزیکی (پستی)
                            </span>
                          )}

                          {/* If order completed, provide 1-click access for digital */}
                          {isCompleted && item.is_digital && (
                            item.content_type === 'video' || item.content_type === 'pdf' ? (
                              <Link href={`/shop/${item.store_item_id}/view`} className="button button-primary py-1.5 px-3 text-xs flex items-center gap-1 shadow-sm">
                                <Play className="w-3.5 h-3.5" /> مشاهده آنلاین
                              </Link>
                            ) : item.file_url ? (
                              <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="button button-primary py-1.5 px-3 text-xs flex items-center gap-1 shadow-sm">
                                <Download className="w-3.5 h-3.5" /> دانلود فایل
                              </a>
                            ) : null
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Physical Items Shipping Info if physical items present */}
                  {order.has_physical && order.shipping_address && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-ink-soft space-y-1 mt-3">
                      <div className="font-bold text-ink flex items-center gap-1.5 text-sm">
                        <MapPin className="w-4 h-4 text-amber-700" /> آدرس پستی ثبت‌شده جهت ارسال:
                      </div>
                      <p className="pr-5 text-ink leading-relaxed">{order.shipping_address}</p>
                      {order.postal_code && (
                        <div className="pr-5 font-mono text-ink-soft">کد پستی: {order.postal_code}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pending Actions Footer */}
                {isPending && (
                  <div className="pt-5 border-t border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Receipt Status or Upload */}
                    {order.status === 'pending_approval' ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> رسید بانکی شما ارسال شده و در صف بررسی است.
                        </span>
                        {order.receipt_url && (
                          <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> مشاهده تصویر رسید
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <label className="button button-ghost border border-line-soft text-xs font-bold py-2.5 px-4 cursor-pointer hover:border-teal flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-teal" />
                          <span>{uploadingReceiptOrderId === order.id ? 'در حال ارسال رسید...' : 'ثبت فیش واریز کارت به کارت'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={uploadingReceiptOrderId === order.id}
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) handleUploadReceipt(order.id, file)
                            }}
                          />
                        </label>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {order.status === 'pending_payment' && (
                        <button
                          onClick={() => handleOnlinePay(order.id)}
                          disabled={payingOrderId === order.id}
                          className="button button-primary py-2.5 px-5 text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 rounded-xl"
                        >
                          {payingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          <span>پرداخت آنلاین (زرین‌پال)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="button button-danger py-2.5 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-red-700"
                      >
                        {cancellingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span>لغو سفارش</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
