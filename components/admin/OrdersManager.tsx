'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ShoppingBag, CreditCard, Loader2, CheckCircle2, XCircle, Clock, 
  Package, Eye, Trash2, Edit3, Search, X, AlertTriangle, Truck,
  FileText, ArrowUpDown, RefreshCw, MapPin, Hash, Phone, User
} from 'lucide-react'

export interface OrderItem {
  id: string
  order_id: string
  store_item_id: string
  quantity: number
  price_cents: number
  title: string
  thumbnail_url: string | null
  is_digital: boolean
  deleted?: boolean
}

export interface AdminOrder {
  id: string
  user_id: string
  full_name: string
  phone: string
  shipping_address: string | null
  postal_code: string | null
  tracking_code?: string | null
  total_cents: number
  status: string
  payment_method: string | null
  payment_gateway_ref: string | null
  payment_card_pan: string | null
  receipt_url: string | null
  paid_at: string | null
  created_at: string
  notes: string | null
  user_name?: string | null
  user_email?: string | null
  items: OrderItem[]
}

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'در انتظار پرداخت', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'pending_approval', label: 'در انتظار تایید رسید', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'approved', label: 'تایید شده', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'processing', label: 'در حال ارسال / پردازش', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'completed', label: 'تکمیل و تحویل شده', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'rejected', label: 'رد شده', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'cancelled', label: 'لغو شده', color: 'bg-slate-100 text-slate-700 border-slate-300' },
]

export default function OrdersManager({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handleManualCleanup = async () => {
    if (!confirm('آیا مایلید تمام سفارش‌های پرداخت‌نشده قدیمی‌تر از ۳ روز (۷۲ ساعت) پاکسازی شوند؟')) return

    setCleaning(true)
    try {
      const res = await fetch('/api/admin/orders/cleanup', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        showToast(`پاکسازی با موفقیت انجام شد: ${data.deletedCount} سفارش منقضی‌شده حذف گردید.`)
        // Remove pending_payment older than 3 days from local state
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
        setOrders(prev => prev.filter(o => !(o.status === 'pending_payment' && !o.paid_at && new Date(o.created_at).getTime() < threeDaysAgo)))
      } else {
        showToast(data.error || 'خطا در پاکسازی سفارشات', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور در پاکسازی سفارشات', 'error')
    } finally {
      setCleaning(false)
    }
  }

  const handleQuickStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        showToast('وضعیت سفارش به‌روزرسانی شد.')
      } else {
        showToast('خطا در تغییر وضعیت سفارش', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('آیا از حذف این سفارش مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')) return

    setDeletingId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
        showToast('سفارش با موفقیت حذف شد.')
      } else {
        const data = await res.json()
        showToast(data.error || 'خطا در حذف سفارش', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور در حذف سفارش', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveEditedOrder = async (updated: AdminOrder) => {
    setUpdating(updated.id)
    try {
      const res = await fetch(`/api/admin/orders/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (res.ok) {
        // Re-filter items that were deleted
        const cleanItems = updated.items.filter(i => !i.deleted)
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...updated, items: cleanItems } : o))
        setEditingOrder(null)
        showToast('سفارش با موفقیت ویرایش و ذخیره شد.')
      } else {
        const data = await res.json()
        showToast(data.error || 'خطا در ویرایش سفارش', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (filter !== 'all') {
        if (filter === 'rejected_or_cancelled') {
          if (order.status !== 'rejected' && order.status !== 'cancelled') return false
        } else if (order.status !== filter) {
          return false
        }
      }

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const matchName = order.full_name?.toLowerCase().includes(q)
        const matchPhone = order.phone?.toLowerCase().includes(q)
        const matchId = order.id?.toLowerCase().includes(q)
        const matchPostal = order.postal_code?.toLowerCase().includes(q)
        const matchTracking = order.tracking_code?.toLowerCase().includes(q)
        const matchGateway = order.payment_gateway_ref?.toLowerCase().includes(q)
        return matchName || matchPhone || matchId || matchPostal || matchTracking || matchGateway
      }

      return true
    })
  }, [orders, filter, search])

  const stats = useMemo(() => {
    const total = orders.length
    const pendingPayment = orders.filter(o => o.status === 'pending_payment').length
    const pendingApproval = orders.filter(o => o.status === 'pending_approval').length
    const inProgress = orders.filter(o => o.status === 'approved' || o.status === 'processing').length
    const completed = orders.filter(o => o.status === 'completed').length
    return { total, pendingPayment, pendingApproval, inProgress, completed }
  }, [orders])

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(o => o.value === status)
    if (opt) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${opt.color}`}>
          {opt.label}
        </span>
      )
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">{status}</span>
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-2xl text-sm font-black flex items-center gap-2 border-2 shadow-sm ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header & Quick Links */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="section-kicker"><ShoppingBag className="w-4 h-4" /> مدیریت فروشگاه</span>
          <h1 className="text-2xl md:text-3xl font-black text-ink">سفارشات مشتریان</h1>
          <p className="text-xs md:text-sm text-ink-soft mt-1">مشاهده، ویرایش وضعیت، اطلاعات ارسال و مدیریت کامل فاکتورهای مشتریان</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/payment" 
            className="flex items-center gap-2 text-xs font-black text-teal-deep bg-white border-2 border-slate-300 hover:border-teal px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <CreditCard className="w-4 h-4 text-teal" />
            <span>تنظیمات درگاه و شماره کارت</span>
          </Link>
        </div>
      </div>

      {/* Section: 3-Day Expiry Policy & Manual Cleanup */}
      <section className="bg-white p-6 md:p-7 rounded-3xl border-2 border-slate-300 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 border-2 border-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">سیاست انقضای سفارشات پرداخت‌نشده</h2>
              <p className="text-xs text-slate-600 font-medium">قوانین و حذف خودکار سفارشات معلق فروشگاه</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualCleanup}
            disabled={cleaning}
            className="border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 py-2.5 px-4 text-xs font-black rounded-xl whitespace-nowrap flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {cleaning ? <Loader2 className="w-4 h-4 animate-spin text-amber-800" /> : <Trash2 className="w-4 h-4 text-amber-700" />}
            <span>پاکسازی دستی سفارشات منقضی‌شده</span>
          </button>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900">حذف خودکار پس از ۳ روز (۷۲ ساعت)</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              هر سفارشی که در وضعیت «در انتظار پرداخت» قرار دارد و پس از ۳ روز وجه آن تسویه نشود، به صورت خودکار از پایگاه داده حذف می‌گردد تا موجودی و سبد سفارشات آزاد شود.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700">
              مدت اعتبار: ۳ روز
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
            <span className="text-xs text-slate-600 font-medium block mb-1">کل سفارشات</span>
            <span className="text-xl font-black text-slate-900">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
            <span className="text-xs text-amber-800 font-medium block mb-1">در انتظار پرداخت</span>
            <span className="text-xl font-black text-amber-900">{stats.pendingPayment}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-center">
            <span className="text-xs text-yellow-800 font-medium block mb-1">در انتظار بررسی رسید</span>
            <span className="text-xl font-black text-yellow-900">{stats.pendingApproval}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-center">
            <span className="text-xs text-blue-800 font-medium block mb-1">در حال آماده‌سازی</span>
            <span className="text-xl font-black text-blue-900">{stats.inProgress}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-emerald-800 font-medium block mb-1">تکمیل شده</span>
            <span className="text-xl font-black text-emerald-900">{stats.completed}</span>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو با نام مشتری، تلفن، آدرس، کد پستی یا رهگیری..."
              className="w-full pr-11 pl-10 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all font-medium"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-600 font-bold self-end md:self-center">
            تعداد نتایج: <span className="text-teal-deep font-black text-sm">{filtered.length}</span> سفارش
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'همه سفارشات' },
            { id: 'pending_payment', label: 'در انتظار پرداخت' },
            { id: 'pending_approval', label: 'در انتظار تایید رسید' },
            { id: 'approved', label: 'تایید شده' },
            { id: 'processing', label: 'در حال ارسال' },
            { id: 'completed', label: 'تکمیل شده' },
            { id: 'rejected_or_cancelled', label: 'رد / لغو شده' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 cursor-pointer ${
                filter === f.id 
                  ? 'bg-teal text-white border-teal shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-300 hover:border-teal/50 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border-2 border-slate-300 text-slate-500 font-medium space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-700">هیچ سفارشی با این مشخصات یافت نشد.</p>
            <p className="text-xs text-slate-400">فیلتر وضعیت یا عبارت جستجو را تغییر دهید.</p>
          </div>
        ) : (
          filtered.map(order => (
            <div 
              key={order.id} 
              className="bg-white rounded-3xl border-2 border-slate-300 shadow-sm overflow-hidden hover:border-slate-400 transition-all"
            >
              {/* Order Card Top Bar */}
              <div className="p-5 bg-slate-50/80 border-b-2 border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-500 font-mono" dir="ltr">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {new Date(order.created_at).toLocaleDateString('fa-IR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal" />
                    <span>{order.full_name}</span>
                    <span className="text-xs font-bold text-slate-500 font-mono" dir="ltr">({order.phone})</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-left">
                    <div className="text-xs text-slate-500 font-medium mb-0.5">مبلغ کل</div>
                    <div className="font-black text-teal-deep text-lg">
                      {Math.round(order.total_cents / 10).toLocaleString()} تومان
                    </div>
                  </div>
                  <div className="h-8 w-0.5 bg-slate-300 hidden sm:block"></div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500 font-medium mb-0.5">وضعیت</div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>

              {/* Order Card Details */}
              <div className="p-5 grid md:grid-cols-2 gap-8">
                {/* Left Column: Ordered Items */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-sm pb-2 border-b-2 border-slate-200 flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal" />
                    <span>اقلام سفارش ({order.items?.length || 0})</span>
                  </h3>
                  <div className="space-y-2.5">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex gap-3 items-center p-2.5 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                          <img 
                            src={item.thumbnail_url || 'https://placehold.co/100'} 
                            alt={item.title} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-sm text-slate-900 truncate">{item.title}</div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {item.quantity} عدد × {Math.round(item.price_cents / 10).toLocaleString()} تومان
                            </div>
                          </div>
                          {item.is_digital ? (
                            <span className="text-xs font-black bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-lg shrink-0">
                              دیجیتال
                            </span>
                          ) : (
                            <span className="text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                              فیزیکی
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">هیچ قلم کالایی در این سفارش ثبت نشده است.</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Shipping & Payment Info */}
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 text-sm pb-2 border-b-2 border-slate-200 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal" />
                    <span>اطلاعات ارسال، پرداخت و رهگیری</span>
                  </h3>

                  <div className="text-xs space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">روش پرداخت:</span>
                      <span className="font-black text-slate-900">
                        {order.payment_method === 'gateway' ? 'درگاه اینترنتی (زرین‌پال)' : 'واریز کارت به کارت'}
                      </span>
                    </div>

                    {order.payment_gateway_ref && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">کد پیگیری درگاه:</span>
                        <span className="font-mono font-bold text-teal-deep" dir="ltr">{order.payment_gateway_ref}</span>
                      </div>
                    )}

                    {order.payment_card_pan && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">شماره کارت واریزکننده:</span>
                        <span className="font-mono text-slate-700" dir="ltr">{order.payment_card_pan}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">کد پستی:</span>
                      <span className="font-mono font-bold text-slate-900">{order.postal_code || '-'}</span>
                    </div>

                    {order.tracking_code && (
                      <div className="flex justify-between py-1 border-b border-slate-100 bg-teal/5 p-2 rounded-xl">
                        <span className="text-teal font-black">کد رهگیری پستی:</span>
                        <span className="font-mono font-black text-teal-deep" dir="ltr">{order.tracking_code}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 font-medium block mb-1">آدرس پستی تحویل:</span>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-900 leading-relaxed font-medium">
                        {order.shipping_address || 'آدرسی ثبت نشده است (سفارش تماماً دیجیتال یا نامشخص)'}
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">یادداشت سفارش:</span>
                        <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-amber-950 text-xs leading-relaxed font-medium">
                          {order.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Receipt Viewer Button */}
                  {order.payment_method === 'card2card' && order.receipt_url && (
                    <div>
                      <button 
                        type="button"
                        onClick={() => setSelectedImage(order.receipt_url)} 
                        className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-300 hover:border-teal bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-teal" />
                        <span>مشاهده تصویر فیش و رسید بانکی</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Card Footer Controls */}
              <div className="p-4 bg-slate-50 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
                {/* Quick Status Select */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-600">تغییر وضعیت سریع:</span>
                  <select
                    value={order.status}
                    onChange={e => handleQuickStatus(order.id, e.target.value)}
                    disabled={updating === order.id}
                    className="text-xs font-bold px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 outline-none focus:border-teal transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {updating === order.id && <Loader2 className="w-4 h-4 animate-spin text-teal" />}
                </div>

                {/* Full Edit & Delete Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(order)}
                    className="px-4 py-2 rounded-xl border-2 border-slate-300 hover:border-teal bg-white text-slate-900 hover:text-teal-deep text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-teal" />
                    <span>ویرایش کامل سفارش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={deletingId === order.id}
                    className="px-3 py-2 rounded-xl border-2 border-rose-300 hover:border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-rose-600" />}
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal 
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEditedOrder}
          isSaving={updating === editingOrder.id}
        />
      )}

      {/* Receipt Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" 
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-full" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="رسید پرداختی بانکی" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border-4 border-white shadow-2xl" 
            />
            <button 
              type="button"
              className="absolute -top-3 -right-3 w-9 h-9 bg-white text-black font-black rounded-full flex items-center justify-center shadow-xl hover:bg-slate-200 transition-colors cursor-pointer" 
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EditOrderModal({ 
  order, 
  onClose, 
  onSave, 
  isSaving 
}: { 
  order: AdminOrder
  onClose: () => void
  onSave: (updated: AdminOrder) => void
  isSaving: boolean
}) {
  const [formData, setFormData] = useState({
    status: order.status || 'pending_payment',
    full_name: order.full_name || '',
    phone: order.phone || '',
    shipping_address: order.shipping_address || '',
    postal_code: order.postal_code || '',
    tracking_code: order.tracking_code || '',
    total_toman: Math.round(order.total_cents / 10),
    payment_method: order.payment_method || 'gateway',
    payment_gateway_ref: order.payment_gateway_ref || '',
    payment_card_pan: order.payment_card_pan || '',
    notes: order.notes || ''
  })

  const [items, setItems] = useState<OrderItem[]>(
    order.items ? order.items.map(i => ({ ...i })) : []
  )

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleToggleDeleteItem = (index: number) => {
    setItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], deleted: !copy[index].deleted }
      return copy
    })
  }

  const handleRecalculateTotal = () => {
    const activeItems = items.filter(i => !i.deleted)
    const sumCents = activeItems.reduce((acc, curr) => acc + (Number(curr.price_cents) || 0) * (Number(curr.quantity) || 1), 0)
    setFormData(prev => ({ ...prev, total_toman: Math.round(sumCents / 10) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...order,
      status: formData.status,
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      shipping_address: formData.shipping_address.trim() || null,
      postal_code: formData.postal_code.trim() || null,
      tracking_code: formData.tracking_code.trim() || null,
      total_cents: Number(formData.total_toman) * 10,
      payment_method: formData.payment_method,
      payment_gateway_ref: formData.payment_gateway_ref.trim() || null,
      payment_card_pan: formData.payment_card_pan.trim() || null,
      notes: formData.notes.trim() || null,
      items
    })
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl border-2 border-slate-300 shadow-2xl p-6 md:p-8 my-8 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal" />
              <span>ویرایش مشخصات کامل سفارش</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              شناسه سفارش: <span className="font-mono text-slate-800" dir="ltr">{order.id}</span>
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status & Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                وضعیت سفارش <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm outline-none focus:border-teal"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                روش پرداخت
              </label>
              <select
                value={formData.payment_method}
                onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm outline-none focus:border-teal"
              >
                <option value="gateway">درگاه پرداخت اینترنتی زرین‌پال</option>
                <option value="card2card">واریز کارت به کارت</option>
              </select>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                نام و نام خانوادگی خریدار <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-medium text-sm outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                شماره موبایل خریدار <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* Postal & Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                کد پستی ۱۰ رقمی
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="مثلاً: 1234567890"
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                کد رهگیری مرسوله پستی (پیشتاز / تیپاکس)
              </label>
              <input
                type="text"
                value={formData.tracking_code}
                onChange={e => setFormData({ ...formData, tracking_code: e.target.value })}
                placeholder="شماره رهگیری پستی مرسوله..."
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              آدرس کامل پستی ارسال
            </label>
            <textarea
              rows={2}
              value={formData.shipping_address}
              onChange={e => setFormData({ ...formData, shipping_address: e.target.value })}
              placeholder="استان، شهر، خیابان، پلاک، واحد..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-medium text-sm outline-none focus:border-teal leading-relaxed"
            />
          </div>

          {/* Total Amount & Gateway Ref */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                مبلغ نهایی سفارش (تومان) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                value={formData.total_toman}
                onChange={e => setFormData({ ...formData, total_toman: Number(e.target.value) })}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono font-bold text-sm outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                کد رهگیری درگاه (زرین‌پال)
              </label>
              <input
                type="text"
                value={formData.payment_gateway_ref}
                onChange={e => setFormData({ ...formData, payment_gateway_ref: e.target.value })}
                placeholder="شماره تراکنش درگاه..."
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                کارت پرداخت‌کننده (PAN)
              </label>
              <input
                type="text"
                value={formData.payment_card_pan}
                onChange={e => setFormData({ ...formData, payment_card_pan: e.target.value })}
                placeholder="۴ یا ۱۶ رقم کارت..."
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* Order Items Editor */}
          {items.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                <span className="text-xs font-black text-slate-900">اقلام و فاکتور سفارش</span>
                <button
                  type="button"
                  onClick={handleRecalculateTotal}
                  className="text-xs font-black text-teal hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>محاسبه خودکار مبلغ کل از روی اقلام</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      item.deleted ? 'bg-rose-50/60 border-rose-200 opacity-60' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-black block truncate ${item.deleted ? 'line-through text-rose-700' : 'text-slate-900'}`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 font-medium">تعداد:</span>
                        <input
                          type="number"
                          min={1}
                          disabled={item.deleted}
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs font-mono font-bold rounded-lg border-2 border-slate-300 bg-white text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 font-medium">قیمت (تومان):</span>
                        <input
                          type="number"
                          min={0}
                          disabled={item.deleted}
                          value={Math.round(item.price_cents / 10)}
                          onChange={e => handleItemChange(idx, 'price_cents', Number(e.target.value) * 10)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold rounded-lg border-2 border-slate-300 bg-white text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleDeleteItem(idx)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          item.deleted 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                        }`}
                        title={item.deleted ? 'بازگردانی این آیتم' : 'حذف این قلم'}
                      >
                        {item.deleted ? 'بازگردانی' : <Trash2 className="w-3.5 h-3.5 text-rose-700" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              یادداشت مدیر یا توضیحات سفارش
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="توضیحات اختیاری..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-medium text-sm outline-none focus:border-teal leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl border-2 border-teal-700 bg-teal hover:bg-teal-deep text-white font-black text-xs shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>ذخیره تغییرات سفارش</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
