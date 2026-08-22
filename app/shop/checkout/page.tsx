'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/store-context'
import { useRouter } from 'next/navigation'
import { ArrowRight, CreditCard, Globe, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart, isLoading: cartLoading } = useCart()
  
  const hasPhysicalItems = items.some(item => !item.is_digital)
  
  const [step, setStep] = useState(1) // 1: Shipping/Info, 2: Payment, 3: Success
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    postalCode: '',
    paymentMethod: 'card2card', // or 'gateway'
    receiptUrl: ''
  })
  
  const [adminCard, setAdminCard] = useState({ number: '', name: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch admin card details on load
  useEffect(() => {
    fetch('/api/public-settings?keys=admin_card_number,admin_card_name')
      .then(r => r.json())
      .then(data => {
        setAdminCard({
          number: data.admin_card_number || 'شماره کارتی ثبت نشده است',
          name: data.admin_card_name || 'نامشخص'
        })
      })
  }, [])

  // If cart loaded and empty, redirect
  useEffect(() => {
    if (!cartLoading && items.length === 0 && step !== 3) {
      router.push('/shop')
    }
  }, [items, cartLoading, step, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('kind', 'receipt') // New kind for API
    
    try {
      const res = await fetch('/api/admin/content/upload', { // I will add 'receipt' support to existing upload route!
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setForm({ ...form, receiptUrl: data.url })
      } else {
        alert(data.error || 'خطا در آپلود رسید')
      }
    } catch (e) {
      alert('خطای ارتباط با سرور')
    } finally {
      setIsUploading(false)
    }
  }

  const submitOrder = async () => {
    if (form.paymentMethod === 'card2card' && !form.receiptUrl && totalPrice > 0) {
      alert('لطفاً تصویر رسید پرداخت را آپلود کنید.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName,
          phone: form.phone,
          shipping_address: form.address,
          postal_code: form.postalCode,
          payment_method: form.paymentMethod,
          receipt_url: form.receiptUrl
        })
      })
      
      const data = await res.json()
      if (data.success) {
        if (form.paymentMethod === 'gateway') {
          // Fake gateway redirect for now
          alert('درگاه پرداخت در آینده اضافه خواهد شد. سفارش شما فعلا ثبت شد.')
        }
        await clearCart()
        setStep(3)
      } else {
        alert(data.error || 'خطا در ثبت سفارش')
      }
    } catch (e) {
      alert('خطای ارتباط با سرور')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartLoading && step !== 3) {
    return (
      <div className="page">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal" />
        </main>
      </div>
    )
  }

  return (
    <div className="page fade-in bg-background min-h-screen pb-20">
      <SiteHeader />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {step === 3 ? (
          <div className="card text-center py-16 flex flex-col items-center slide-up">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">سفارش شما با موفقیت ثبت شد!</h1>
            <p className="text-ink-soft mb-8 max-w-md mx-auto leading-relaxed">
              {form.paymentMethod === 'card2card' 
                ? 'رسید پرداخت شما دریافت شد. پس از بررسی توسط مدیریت، وضعیت سفارش تغییر خواهد کرد.'
                : 'درخواست پرداخت شما ثبت شد.'}
            </p>
            <Link href="/dashboard" className="button button-primary">
              پیگیری سفارش در پنل کاربری
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6 slide-up">
              
              {/* Step 1: Info */}
              {step === 1 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm">۱</span>
                    اطلاعات {hasPhysicalItems ? 'ارسال' : 'خریدار'}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-1">نام و نام خانوادگی *</label>
                        <input 
                          value={form.fullName}
                          onChange={e => setForm({...form, fullName: e.target.value})}
                          className="w-full p-3 rounded-xl border border-line-soft bg-cream"
                          placeholder="مثال: علی احمدی"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">شماره تماس *</label>
                        <input 
                          value={form.phone}
                          onChange={e => setForm({...form, phone: e.target.value})}
                          className="w-full p-3 rounded-xl border border-line-soft bg-cream"
                          placeholder="0912..."
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {hasPhysicalItems && (
                      <>
                        <div>
                          <label className="block text-sm font-bold mb-1">کد پستی *</label>
                          <input 
                            value={form.postalCode}
                            onChange={e => setForm({...form, postalCode: e.target.value})}
                            className="w-full p-3 rounded-xl border border-line-soft bg-cream"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-1">آدرس دقیق پستی *</label>
                          <textarea 
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                            className="w-full p-3 rounded-xl border border-line-soft bg-cream"
                            rows={3}
                            placeholder="استان، شهر، خیابان، پلاک..."
                          />
                        </div>
                      </>
                    )}

                    <button 
                      onClick={() => {
                        if (!form.fullName || !form.phone) return alert('نام و شماره تماس الزامی است')
                        if (hasPhysicalItems && (!form.address || !form.postalCode)) return alert('آدرس و کد پستی الزامی است')
                        setStep(2)
                      }}
                      className="button button-primary w-full mt-4 justify-center"
                    >
                      مرحله بعد: پرداخت
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="card">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setStep(1)} className="p-2 hover:bg-cream rounded-full transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm">۲</span>
                      انتخاب روش پرداخت
                    </h2>
                  </div>

                  {totalPrice === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold mb-6">مبلغ قابل پرداخت: رایگان</div>
                      <button onClick={submitOrder} disabled={isSubmitting} className="button button-primary w-full justify-center">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ثبت نهایی سفارش'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors ${form.paymentMethod === 'card2card' ? 'border-teal bg-teal/5 text-teal-deep' : 'border-line-soft hover:border-gray-300'}`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={form.paymentMethod === 'card2card'}
                            onChange={() => setForm({...form, paymentMethod: 'card2card'})}
                          />
                          <CreditCard className="w-8 h-8" />
                          <span className="font-bold">کارت به کارت</span>
                        </label>
                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors ${form.paymentMethod === 'gateway' ? 'border-teal bg-teal/5 text-teal-deep' : 'border-line-soft hover:border-gray-300'}`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={form.paymentMethod === 'gateway'}
                            onChange={() => setForm({...form, paymentMethod: 'gateway'})}
                          />
                          <Globe className="w-8 h-8" />
                          <span className="font-bold">درگاه اینترنتی</span>
                        </label>
                      </div>

                      {form.paymentMethod === 'card2card' && (
                        <div className="bg-cream p-5 rounded-xl border border-line-soft space-y-4">
                          <p className="text-sm leading-relaxed text-ink-soft">لطفاً مبلغ فاکتور را به شماره کارت زیر واریز کرده و تصویر رسید آن را آپلود کنید.</p>
                          <div className="bg-white p-4 rounded-lg border border-line-soft text-center space-y-2">
                            <div className="font-mono text-xl font-bold tracking-widest">{adminCard.number}</div>
                            <div className="text-sm text-ink-soft">بنام: {adminCard.name}</div>
                          </div>
                          
                          <div>
                            <label className="button button-ghost w-full justify-center border-dashed border-2 hover:bg-white cursor-pointer py-4">
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                              {isUploading ? 'در حال آپلود...' : (form.receiptUrl ? 'تغییر رسید' : 'آپلود تصویر رسید')}
                            </label>
                            {form.receiptUrl && (
                              <div className="mt-3 bg-green-50 text-green-700 p-2 rounded text-sm text-center border border-green-200">
                                رسید با موفقیت آپلود شد!
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={submitOrder} 
                        disabled={isSubmitting || (form.paymentMethod === 'card2card' && !form.receiptUrl)} 
                        className="button button-primary w-full justify-center button-lg shadow-lg"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (form.paymentMethod === 'gateway' ? 'انتقال به درگاه پرداخت' : 'ثبت نهایی سفارش')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="md:col-span-1">
              <div className="card sticky top-24">
                <h3 className="font-bold text-lg mb-4">خلاصه سفارش</h3>
                <div className="space-y-4 divide-y divide-line-soft">
                  {items.map(item => (
                    <div key={item.store_item_id} className="pt-4 flex items-center gap-3">
                      <img src={item.thumbnail_url || ''} className="w-12 h-12 rounded object-cover border border-line-soft" />
                      <div className="flex-1 text-sm">
                        <div className="font-bold line-clamp-1">{item.title}</div>
                        <div className="text-ink-soft">{item.quantity} عدد</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 flex items-center justify-between font-bold text-lg border-t border-line-soft mt-4">
                    <span>مبلغ کل:</span>
                    <span className="text-teal-deep">{totalPrice / 10} تومان</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
