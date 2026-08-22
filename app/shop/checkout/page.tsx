'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/store-context'
import { useRouter } from 'next/navigation'
import { ArrowRight, CreditCard, Globe, UploadCloud, Loader2, CheckCircle2, User, Phone, MapPin, Mail, ShieldCheck, Check, ShoppingCart, ChevronLeft } from 'lucide-react'
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
    formData.append('kind', 'receipt')
    
    try {
      const res = await fetch('/api/store/upload-receipt', {
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
      <div className="page bg-background min-h-screen">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal" />
        </main>
      </div>
    )
  }

  return (
    <div className="page fade-in bg-[#f8fafc] min-h-screen pb-20 font-sans">
      <SiteHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Beautiful Stepper */}
        {step !== 3 && (
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-line-soft -z-10 rounded-full" />
              <div className="absolute left-0 right-1/2 top-1/2 h-1 transition-all duration-500 -z-10 rounded-full" style={{ backgroundColor: step >= 2 ? 'var(--teal)' : 'transparent' }} />
              
              <div className="flex flex-col items-center gap-2 bg-[#f8fafc] px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all shadow-sm ${step >= 1 ? 'bg-teal text-white ring-4 ring-teal/20' : 'bg-white text-ink-soft border-2 border-line-soft'}`}>۱</div>
                <span className={`text-sm font-bold ${step >= 1 ? 'text-teal-deep' : 'text-ink-soft'}`}>اطلاعات شما</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-[#f8fafc] px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all shadow-sm ${step >= 2 ? 'bg-teal text-white ring-4 ring-teal/20' : 'bg-white text-ink-soft border-2 border-line-soft'}`}>۲</div>
                <span className={`text-sm font-bold ${step >= 2 ? 'text-teal-deep' : 'text-ink-soft'}`}>پرداخت</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-[#f8fafc] px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all shadow-sm ${step === 3 ? 'bg-teal text-white ring-4 ring-teal/20' : 'bg-white text-ink-soft border-2 border-line-soft'}`}>۳</div>
                <span className={`text-sm font-bold ${step === 3 ? 'text-teal-deep' : 'text-ink-soft'}`}>تکمیل سفارش</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden slide-up border border-line-soft/30">
            <div className="bg-gradient-to-br from-teal-deep to-teal p-12 text-center text-white">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
                <CheckCircle2 className="w-14 h-14 text-white drop-shadow-md" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">سفارش شما با موفقیت ثبت شد!</h1>
              <p className="text-teal-50 text-lg opacity-90 max-w-md mx-auto leading-relaxed">
                {form.paymentMethod === 'card2card' 
                  ? 'رسید پرداخت شما دریافت شد. پس از بررسی توسط مدیریت، وضعیت سفارش تغییر خواهد کرد.'
                  : 'درخواست پرداخت شما ثبت شد.'}
              </p>
            </div>
            <div className="p-8 text-center bg-white">
              <p className="text-ink-soft mb-8 text-lg">از خرید شما سپاسگزاریم. برای پیگیری سفارش خود می‌توانید به پنل کاربری مراجعه کنید.</p>
              <Link href="/dashboard" className="button bg-teal text-white hover:bg-teal-deep button-lg inline-flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all rounded-xl px-8">
                رفتن به پنل کاربری <ChevronLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 slide-up">
              
              {/* Step 1: Info */}
              {step === 1 && (
                <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-line-soft/50">
                  <h2 className="text-2xl font-bold mb-8 text-ink flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center text-teal">
                      <User className="w-6 h-6" />
                    </div>
                    اطلاعات {hasPhysicalItems ? 'ارسال' : 'خریدار'}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-ink-soft ml-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal transition-colors" />
                          <input 
                            value={form.fullName}
                            onChange={e => setForm({...form, fullName: e.target.value})}
                            className="w-full py-4 pr-12 pl-4 rounded-2xl border-2 border-line-soft bg-gray-50 focus:bg-white focus:border-teal transition-all text-ink font-bold outline-none shadow-sm"
                            placeholder="مثال: علی احمدی"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-ink-soft ml-1">شماره تماس <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal transition-colors" />
                          <input 
                            value={form.phone}
                            onChange={e => setForm({...form, phone: e.target.value})}
                            className="w-full py-4 pr-12 pl-4 rounded-2xl border-2 border-line-soft bg-gray-50 focus:bg-white focus:border-teal transition-all text-ink font-bold outline-none shadow-sm"
                            placeholder="0912..."
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {hasPhysicalItems && (
                      <div className="space-y-6 pt-8 mt-8 border-t border-dashed border-line-soft">
                        <h3 className="text-xl font-bold text-ink flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center text-teal">
                            <MapPin className="w-6 h-6" />
                          </div>
                          آدرس پستی
                        </h3>
                        <div>
                          <label className="text-sm font-bold text-ink-soft ml-1 mb-2 block">کد پستی <span className="text-red-500">*</span></label>
                          <input 
                            value={form.postalCode}
                            onChange={e => setForm({...form, postalCode: e.target.value})}
                            className="w-full md:w-1/2 py-4 px-5 rounded-2xl border-2 border-line-soft bg-gray-50 focus:bg-white focus:border-teal transition-all text-ink font-bold tracking-widest outline-none shadow-sm"
                            dir="ltr"
                            placeholder="1234567890"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-ink-soft ml-1 mb-2 block">آدرس دقیق <span className="text-red-500">*</span></label>
                          <textarea 
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                            className="w-full p-5 rounded-2xl border-2 border-line-soft bg-gray-50 focus:bg-white focus:border-teal transition-all text-ink font-bold resize-none leading-loose outline-none shadow-sm"
                            rows={3}
                            placeholder="استان، شهر، خیابان، پلاک، واحد..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-8 flex justify-end">
                      <button 
                        onClick={() => {
                          if (!form.fullName || !form.phone) return alert('لطفاً نام و شماره تماس خود را وارد کنید.')
                          if (hasPhysicalItems && (!form.address || !form.postalCode)) return alert('لطفاً آدرس دقیق و کد پستی را وارد کنید.')
                          setStep(2)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="button bg-teal text-white hover:bg-teal-deep w-full md:w-auto button-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group rounded-xl px-10 py-4 text-lg"
                      >
                        تایید و ادامه پرداخت
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-line-soft/50">
                  <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => setStep(1)} className="p-3 hover:bg-gray-100 rounded-full transition-colors group">
                      <ArrowRight className="w-6 h-6 text-ink-soft group-hover:text-ink transition-colors" />
                    </button>
                    <h2 className="text-2xl font-bold text-ink">انتخاب روش پرداخت</h2>
                  </div>

                  {totalPrice === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-green-200 rounded-3xl bg-green-50">
                      <div className="inline-flex bg-white text-green-700 px-6 py-3 rounded-2xl font-bold mb-8 shadow-sm border border-green-100 text-lg">
                        مبلغ قابل پرداخت: رایگان
                      </div>
                      <button onClick={submitOrder} disabled={isSubmitting} className="button bg-green-600 text-white hover:bg-green-700 w-full md:w-auto mx-auto button-lg shadow-lg justify-center transition-all rounded-xl py-4 px-10 text-lg">
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ثبت نهایی سفارش رایگان'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-5">
                        <label className={`relative cursor-pointer rounded-3xl p-6 flex flex-col gap-5 transition-all duration-300 border-2 overflow-hidden group ${form.paymentMethod === 'card2card' ? 'border-teal bg-teal/5 shadow-md shadow-teal/10' : 'border-line-soft hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={form.paymentMethod === 'card2card'}
                            onChange={() => setForm({...form, paymentMethod: 'card2card'})}
                          />
                          <div className={`absolute top-5 left-5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${form.paymentMethod === 'card2card' ? 'border-teal bg-teal text-white' : 'border-gray-300'}`}>
                            {form.paymentMethod === 'card2card' && <Check className="w-4 h-4" />}
                          </div>
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${form.paymentMethod === 'card2card' ? 'bg-teal text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                            <CreditCard className="w-8 h-8" />
                          </div>
                          <div>
                            <div className={`font-bold text-xl mb-1 ${form.paymentMethod === 'card2card' ? 'text-teal-deep' : 'text-ink'}`}>کارت به کارت</div>
                            <div className="text-sm text-ink-soft">انتقال وجه و آپلود رسید</div>
                          </div>
                        </label>

                        <label className={`relative cursor-pointer rounded-3xl p-6 flex flex-col gap-5 transition-all duration-300 border-2 overflow-hidden group ${form.paymentMethod === 'gateway' ? 'border-teal bg-teal/5 shadow-md shadow-teal/10' : 'border-line-soft hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={form.paymentMethod === 'gateway'}
                            onChange={() => setForm({...form, paymentMethod: 'gateway'})}
                          />
                          <div className={`absolute top-5 left-5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${form.paymentMethod === 'gateway' ? 'border-teal bg-teal text-white' : 'border-gray-300'}`}>
                            {form.paymentMethod === 'gateway' && <Check className="w-4 h-4" />}
                          </div>
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${form.paymentMethod === 'gateway' ? 'bg-teal text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                            <Globe className="w-8 h-8" />
                          </div>
                          <div>
                            <div className={`font-bold text-xl mb-1 ${form.paymentMethod === 'gateway' ? 'text-teal-deep' : 'text-ink'}`}>درگاه پرداخت اینترنتی</div>
                            <div className="text-sm text-ink-soft">پرداخت آنلاین و سریع</div>
                          </div>
                        </label>
                      </div>

                      {form.paymentMethod === 'card2card' && (
                        <div className="bg-gray-50/80 p-6 md:p-8 rounded-3xl border border-line-soft space-y-6">
                          <p className="text-ink-soft leading-relaxed text-sm md:text-base">
                            لطفاً مبلغ کل سفارش را به شماره کارت زیر واریز نموده و تصویر رسید پرداختی خود را در کادر پایین آپلود کنید. سفارش شما پس از بررسی توسط مدیریت، تایید خواهد شد.
                          </p>
                          
                          <div className="bg-white p-8 rounded-2xl border border-line-soft flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-teal-deep to-teal"></div>
                            <div className="text-sm font-bold text-ink-soft">شماره کارت جهت واریز وجه</div>
                            <div className="font-mono text-3xl md:text-4xl font-bold tracking-[0.25em] text-teal-deep text-center">{adminCard.number}</div>
                            <div className="text-base text-ink-soft bg-cream px-5 py-2 rounded-full border border-teal/10">بنام: <span className="font-bold text-ink">{adminCard.name}</span></div>
                          </div>
                          
                          <div>
                            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300 ${form.receiptUrl ? 'border-green-400 bg-green-50 shadow-inner' : 'border-gray-300 bg-white hover:border-teal hover:bg-teal/5'}`}>
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                              
                              {isUploading ? (
                                <div className="flex flex-col items-center text-teal">
                                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                  <span className="font-bold text-lg">در حال آپلود رسید...</span>
                                </div>
                              ) : form.receiptUrl ? (
                                <div className="flex flex-col items-center text-green-700">
                                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                  </div>
                                  <span className="font-bold text-xl">رسید با موفقیت آپلود شد</span>
                                  <span className="text-sm text-green-600 mt-2 hover:underline">برای تغییر تصویر کلیک کنید</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-gray-500 hover:text-teal transition-colors">
                                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5 group-hover:bg-teal/10 transition-colors">
                                    <UploadCloud className="w-10 h-10" />
                                  </div>
                                  <span className="font-bold text-xl mb-2 text-ink">آپلود تصویر رسید پرداخت</span>
                                  <span className="text-sm">برای انتخاب فایل کلیک کنید یا عکس را اینجا رها کنید (JPG, PNG)</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="pt-6">
                        <button 
                          onClick={submitOrder} 
                          disabled={isSubmitting || (form.paymentMethod === 'card2card' && !form.receiptUrl)} 
                          className="button bg-teal text-white hover:bg-teal-deep w-full justify-center button-lg shadow-xl shadow-teal/20 text-xl py-5 rounded-2xl hover:-translate-y-1 transition-all"
                        >
                          {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : (form.paymentMethod === 'gateway' ? 'انتقال به درگاه اینترنتی پرداخت' : 'تایید نهایی سفارش')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2rem] shadow-sm border border-line-soft/50 sticky top-24 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-line-soft bg-gray-50/30 flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-teal" />
                  <h3 className="font-bold text-xl text-ink">خلاصه سفارش</h3>
                </div>
                
                <div className="p-6 md:p-8">
                  <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.store_item_id} className="flex items-center gap-4 group">
                        <div className="relative flex-shrink-0">
                          <img src={item.thumbnail_url || 'https://placehold.co/100'} className="w-20 h-20 rounded-2xl object-cover border border-line-soft shadow-sm group-hover:shadow-md transition-shadow" />
                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-ink line-clamp-2 text-sm mb-1.5 leading-snug group-hover:text-teal transition-colors">{item.title}</div>
                          <div className="text-teal-deep font-bold text-base">
                            {item.discount_price_cents !== null 
                              ? (item.discount_price_cents * item.quantity / 10).toLocaleString()
                              : (item.price_cents! * item.quantity / 10).toLocaleString()} تومان
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-dashed border-line-soft">
                    <div className="flex items-center justify-between text-ink-soft mb-4 text-sm">
                      <span>تعداد اقلام:</span>
                      <span className="font-bold text-ink">{items.reduce((sum, i) => sum + i.quantity, 0)} عدد</span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft mb-6 text-sm">
                      <span>هزینه ارسال:</span>
                      <span className="font-bold text-ink">{hasPhysicalItems ? 'پس‌کرایه (پرداخت درب منزل)' : 'رایگان'}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2 font-bold bg-teal/5 p-6 rounded-2xl border border-teal/10">
                      <span className="text-teal-deep text-sm">مبلغ قابل پرداخت:</span>
                      <span className="text-teal-deep text-3xl">{totalPrice > 0 ? (totalPrice / 10).toLocaleString() + ' تومان' : 'رایگان'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 flex items-center justify-center gap-3 text-ink-soft text-sm font-bold border-t border-line-soft">
                  <ShieldCheck className="w-5 h-5 text-teal" />
                  اطلاعات شما نزد ما محفوظ است
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
