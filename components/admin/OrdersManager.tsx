'use client'

import { useState } from 'react'
import { ShoppingBag, Loader2, CheckCircle2, XCircle, Clock, Package, Eye } from 'lucide-react'

export default function OrdersManager({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const filtered = orders.filter(o => filter === 'all' || o.status === filter)

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm('آیا از تغییر وضعیت این سفارش مطمئن هستید؟')) return
    
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      } else {
        alert('خطا در تغییر وضعیت')
      }
    } catch (e) {
      alert('خطای ارتباط با سرور')
    }
    setUpdating(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval': return <span className="badge bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 ml-1" /> در انتظار تایید رسید</span>
      case 'pending_payment': return <span className="badge bg-orange-100 text-orange-700 border-orange-200"><Clock className="w-3 h-3 ml-1" /> در انتظار پرداخت</span>
      case 'approved': return <span className="badge bg-blue-100 text-blue-700 border-blue-200"><CheckCircle2 className="w-3 h-3 ml-1" /> تایید شده</span>
      case 'processing': return <span className="badge bg-purple-100 text-purple-700 border-purple-200"><Package className="w-3 h-3 ml-1" /> در حال پردازش / ارسال</span>
      case 'completed': return <span className="badge bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 ml-1" /> تکمیل شده</span>
      case 'rejected': return <span className="badge bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 ml-1" /> رد شده</span>
      default: return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="flex flex-col gap-6 slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="section-kicker"><ShoppingBag /> مدیریت فروشگاه</span>
          <h1 className="display" style={{ fontSize: '2.5rem' }}>سفارشات مشتریان</h1>
        </div>
        <div className="flex bg-cream p-1 rounded-xl border border-line-soft">
          {['all', 'pending_approval', 'approved', 'processing', 'completed'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-white shadow-sm text-teal-deep' : 'text-ink-soft hover:bg-white/50'}`}
            >
              {f === 'all' ? 'همه' : f === 'pending_approval' ? 'در انتظار' : f === 'approved' ? 'تایید شده' : f === 'processing' ? 'در حال ارسال' : 'تکمیل'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-center py-12 text-ink-soft">هیچ سفارشی یافت نشد.</div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="card p-0 overflow-hidden">
              <div className="p-5 bg-cream/30 border-b border-line-soft flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <div className="text-sm text-ink-soft mb-1">
                    {new Date(order.created_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </div>
                  <div className="font-bold text-lg">{order.full_name} <span className="text-sm font-normal text-ink-soft mr-2">({order.phone})</span></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="text-sm text-ink-soft mb-1">مبلغ کل</div>
                    <div className="font-bold text-teal-deep text-lg">{(order.total_cents / 10).toLocaleString()} تومان</div>
                  </div>
                  <div className="h-10 w-px bg-line-soft mx-2"></div>
                  <div className="text-left">
                    <div className="text-sm text-ink-soft mb-1">وضعیت</div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>
              
              <div className="p-5 grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-3 border-b pb-2">اقلام سفارش</h3>
                  <div className="space-y-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <img src={item.thumbnail_url || 'https://placehold.co/100'} className="w-12 h-12 rounded object-cover border border-line-soft" />
                        <div>
                          <div className="font-bold text-sm">{item.title}</div>
                          <div className="text-xs text-ink-soft">{item.quantity} عدد × {(item.price_cents / 10).toLocaleString()} تومان</div>
                        </div>
                        {item.is_digital ? (
                          <span className="mr-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">دیجیتال</span>
                        ) : (
                          <span className="mr-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">فیزیکی</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-3 border-b pb-2">اطلاعات ارسال و پرداخت</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-ink-soft">روش پرداخت:</span> <span className="font-bold">{order.payment_method === 'gateway' ? 'درگاه اینترنتی' : 'کارت به کارت'}</span></div>
                      <div className="flex justify-between"><span className="text-ink-soft">کد پستی:</span> <span>{order.postal_code || '-'}</span></div>
                      <div><span className="text-ink-soft block mb-1">آدرس:</span> <div className="bg-cream p-2 rounded text-ink leading-relaxed">{order.shipping_address || 'ندارد'}</div></div>
                    </div>
                  </div>

                  {order.payment_method === 'card2card' && order.receipt_url && (
                    <div>
                      <button onClick={() => setSelectedImage(order.receipt_url)} className="button button-ghost w-full justify-center border-dashed border-2 hover:bg-cream">
                        <Eye className="w-4 h-4" /> مشاهده تصویر رسید پرداختی
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t flex flex-wrap gap-2">
                    {updating === order.id ? (
                      <div className="button button-primary disabled opacity-50"><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت...</div>
                    ) : (
                      <>
                        {order.status === 'pending_approval' && (
                          <>
                            <button onClick={() => updateStatus(order.id, 'approved')} className="button button-primary bg-blue-600 hover:bg-blue-700 border-blue-600 text-white">تایید رسید</button>
                            <button onClick={() => updateStatus(order.id, 'rejected')} className="button button-ghost text-red-600 hover:bg-red-50 border-red-200">رد رسید</button>
                          </>
                        )}
                        {(order.status === 'approved' || order.status === 'processing') && (
                          <>
                            <button onClick={() => updateStatus(order.id, 'processing')} className="button button-primary bg-purple-600 hover:bg-purple-700 border-purple-600 text-white">در حال پردازش/ارسال</button>
                            <button onClick={() => updateStatus(order.id, 'completed')} className="button button-primary bg-green-600 hover:bg-green-700 border-green-600 text-white">تکمیل و تحویل شد</button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl max-h-full">
            <img src={selectedImage} alt="رسید پرداختی" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
            <button className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl" onClick={() => setSelectedImage(null)}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
