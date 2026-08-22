const fs = require('fs');

const code = \'use client'

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
          number: data.admin_card_number || '????? ????? ??? ???? ???',
          name: data.admin_card_name || '??????'
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
        alert(data.error || '??? ?? ????? ????')
      }
    } catch (e) {
      alert('???? ?????? ?? ????')
    } finally {
      setIsUploading(false)
    }
  }

  const submitOrder = async () => {
    if (form.paymentMethod === 'card2card' && !form.receiptUrl && totalPrice > 0) {
      alert('????? ????? ???? ?????? ?? ????? ????.')
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
          alert('????? ?????? ?? ????? ????? ????? ??. ????? ??? ???? ??? ??.')
        }
        await clearCart()
        setStep(3)
      } else {
        alert(data.error || '??? ?? ??? ?????')
      }
    } catch (e) {
      alert('???? ?????? ?? ????')
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
      
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Beautiful Stepper */}
        {step !== 3 && (
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-line-soft -z-10" />
              <div className="absolute left-0 right-1/2 top-1/2 h-0.5 transition-all duration-500 -z-10" style={{ backgroundColor: step >= 2 ? 'var(--teal)' : 'transparent' }} />
              
              <div className="flex flex-col items-center gap-2">
                <div className={\w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shadow-sm \\}>1</div>
                <span className={\	ext-sm font-bold \\}>??????? ???</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={\w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shadow-sm \\}>2</div>
                <span className={\	ext-sm font-bold \\}>??????</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={\w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shadow-sm \\}>3</div>
                <span className={\	ext-sm font-bold \\}>????? ?????</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden slide-up">
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-12 text-center text-white">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <CheckCircle2 className="w-14 h-14 text-white drop-shadow-md" />
              </div>
              <h1 className="text-4xl font-bold mb-4 drop-shadow-md">????? ??? ?? ?????? ??? ??!</h1>
              <p className="text-green-50 text-lg opacity-90 max-w-md mx-auto leading-relaxed">
                {form.paymentMethod === 'card2card' 
                  ? '???? ?????? ??? ?????? ??. ?? ?? ????? ???? ??????? ????? ????? ????? ????? ???.'
                  : '??????? ?????? ??? ??? ??.'}
              </p>
            </div>
            <div className="p-8 text-center bg-white">
              <p className="text-ink-soft mb-8">?? ???? ??? ??????????. ???? ?????? ????? ??? ????????? ?? ??? ?????? ?????? ????.</p>
              <Link href="/dashboard" className="button bg-teal text-white hover:bg-teal-deep button-lg inline-flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all">
                ???? ?? ??? ?????? <ChevronLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 slide-up">
              
              {/* Step 1: Info */}
              {step === 1 && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line-soft/50">
                  <h2 className="text-2xl font-bold mb-8 text-ink flex items-center gap-3">
                    <User className="w-6 h-6 text-teal" />
                    ??????? {hasPhysicalItems ? '?????' : '??????'}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-ink-soft ml-1">??? ? ??? ???????? <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            value={form.fullName}
                            onChange={e => setForm({...form, fullName: e.target.value})}
                            className="w-full py-3.5 pr-12 pl-4 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-ink font-medium"
                            placeholder="????: ??? ?????"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-ink-soft ml-1">????? ???? <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            value={form.phone}
                            onChange={e => setForm({...form, phone: e.target.value})}
                            className="w-full py-3.5 pr-12 pl-4 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-ink font-medium"
                            placeholder="0912..."
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {hasPhysicalItems && (
                      <div className="space-y-6 pt-6 border-t border-line-soft/50">
                        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-teal" /> ???? ????
                        </h3>
                        <div>
                          <label className="text-sm font-bold text-ink-soft ml-1 mb-2 block">?? ???? <span className="text-red-500">*</span></label>
                          <input 
                            value={form.postalCode}
                            onChange={e => setForm({...form, postalCode: e.target.value})}
                            className="w-full md:w-1/2 py-3.5 px-4 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-ink font-medium tracking-widest"
                            dir="ltr"
                            placeholder="1234567890"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-ink-soft ml-1 mb-2 block">???? ???? <span className="text-red-500">*</span></label>
                          <textarea 
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                            className="w-full p-4 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-ink font-medium resize-none leading-loose"
                            rows={3}
                            placeholder="?????? ???? ??????? ????? ????..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={() => {
                          if (!form.fullName || !form.phone) return alert('????? ??? ? ????? ???? ??? ?? ???? ????.')
                          if (hasPhysicalItems && (!form.address || !form.postalCode)) return alert('????? ???? ???? ? ?? ???? ?? ???? ????.')
                          setStep(2)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="button bg-teal text-white hover:bg-teal-deep w-full md:w-auto button-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                      >
                        ????? ? ????? ??????
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line-soft/50">
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                      <ArrowRight className="w-6 h-6 text-ink-soft group-hover:text-ink transition-colors" />
                    </button>
                    <h2 className="text-2xl font-bold text-ink">?????? ??? ??????</h2>
                  </div>

                  {totalPrice === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-green-200 rounded-2xl bg-green-50">
                      <div className="inline-flex bg-white text-green-700 px-6 py-3 rounded-full font-bold mb-8 shadow-sm border border-green-100 text-lg">
                        ???? ???? ??????: ??????
                      </div>
                      <button onClick={submitOrder} disabled={isSubmitting} className="button bg-green-600 text-white hover:bg-green-700 w-full md:w-auto mx-auto button-lg shadow-lg justify-center transition-all">
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : '??? ????? ????? ??????'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-4">
                        <label className={\elative cursor-pointer rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 border-2 overflow-hidden group \\}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={form.paymentMethod === 'card2card'}
                            onChange={() => setForm({...form, paymentMethod: 'card2card'})}
                          />
                          <div className={\bsolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \\}>
                            {form.paymentMethod === 'card2card' && <Check className="w-4 h-4" />}
                          </div>
                          <CreditCard className={\w-10 h-10 \\} />
                          <div>
                            <div className={\ont-bold text-lg mb-1 \\}>???? ?? ????</div>
                            <div className="text-sm text-ink-soft">?????? ??? ? ????? ????</div>
                          </div>
                        </label>

                        <label className={\elative cursor-pointer rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 border-2 overflow-hidden group \\}>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={form.paymentMethod === 'gateway'}
                            onChange={() => setForm({...form, paymentMethod: 'gateway'})}
                          />
                          <div className={\bsolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \\}>
                            {form.paymentMethod === 'gateway' && <Check className="w-4 h-4" />}
                          </div>
                          <Globe className={\w-10 h-10 \\} />
                          <div>
                            <div className={\ont-bold text-lg mb-1 \\}>????? ?????? ????????</div>
                            <div className="text-sm text-ink-soft">?????? ?????? ? ???</div>
                          </div>
                        </label>
                      </div>

                      {form.paymentMethod === 'card2card' && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-line-soft space-y-6">
                          <p className="text-ink-soft leading-relaxed">
                            ????? ???? ?? ????? ?? ?? ????? ???? ??? ????? ????? ? ????? ???? ??????? ??? ?? ?? ???? ????? ????? ????. ????? ??? ?? ?? ????? ???? ??????? ????? ????? ??.
                          </p>
                          
                          <div className="bg-white p-6 rounded-xl border border-line-soft flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 left-0 h-1 bg-teal"></div>
                            <div className="text-sm font-bold text-ink-soft">????? ???? ??? ?????</div>
                            <div className="font-mono text-2xl md:text-3xl font-bold tracking-[0.2em] text-teal-deep">{adminCard.number}</div>
                            <div className="text-base text-ink-soft bg-cream px-4 py-1.5 rounded-full">????: <span className="font-bold text-ink">{adminCard.name}</span></div>
                          </div>
                          
                          <div>
                            <label className={\lex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 \\}>
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                              
                              {isUploading ? (
                                <div className="flex flex-col items-center text-teal">
                                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                  <span className="font-bold">?? ??? ????? ????...</span>
                                </div>
                              ) : form.receiptUrl ? (
                                <div className="flex flex-col items-center text-green-700">
                                  <CheckCircle2 className="w-12 h-12 mb-3" />
                                  <span className="font-bold text-lg">???? ?? ?????? ????? ??</span>
                                  <span className="text-sm text-green-600 mt-1 hover:underline">???? ????? ???? ???? ????</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-gray-500 hover:text-teal transition-colors">
                                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-teal/10">
                                    <UploadCloud className="w-8 h-8" />
                                  </div>
                                  <span className="font-bold text-lg mb-1">????? ????? ???? ??????</span>
                                  <span className="text-sm">???????? ????: JPG, PNG</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-line-soft">
                        <button 
                          onClick={submitOrder} 
                          disabled={isSubmitting || (form.paymentMethod === 'card2card' && !form.receiptUrl)} 
                          className="button bg-teal text-white hover:bg-teal-deep w-full justify-center button-lg shadow-xl shadow-teal/20 text-lg py-4 rounded-2xl hover:-translate-y-1 transition-all"
                        >
                          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (form.paymentMethod === 'gateway' ? '?????? ?? ????? ??????' : '????? ? ??? ????? ?????')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-line-soft/50 sticky top-24 overflow-hidden">
                <div className="p-6 border-b border-line-soft bg-gray-50/50 flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-teal" />
                  <h3 className="font-bold text-xl text-ink">????? ?????</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.store_item_id} className="flex items-center gap-4 group">
                        <div className="relative">
                          <img src={item.thumbnail_url || 'https://placehold.co/100'} className="w-16 h-16 rounded-xl object-cover border border-line-soft shadow-sm group-hover:shadow-md transition-shadow" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-ink line-clamp-2 text-sm mb-1 leading-snug group-hover:text-teal transition-colors">{item.title}</div>
                          <div className="text-teal-deep font-medium text-sm">
                            {item.discount_price_cents !== null 
                              ? (item.discount_price_cents * item.quantity / 10).toLocaleString()
                              : (item.price_cents! * item.quantity / 10).toLocaleString()} ?????
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-300">
                    <div className="flex items-center justify-between text-ink-soft mb-3">
                      <span>????? ?????:</span>
                      <span className="font-bold text-ink">{items.reduce((sum, i) => sum + i.quantity, 0)} ???</span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft mb-6">
                      <span>????? ?????:</span>
                      <span className="font-bold text-ink">{hasPhysicalItems ? '????????' : '??????'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between font-bold text-xl bg-gray-50 p-4 rounded-2xl border border-line-soft">
                      <span>???? ???? ??????:</span>
                      <span className="text-teal-deep text-2xl">{totalPrice > 0 ? (totalPrice / 10).toLocaleString() + ' ?????' : '??????'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-teal/5 p-4 flex items-center justify-center gap-2 text-teal-deep text-sm font-medium border-t border-teal/10">
                  <ShieldCheck className="w-5 h-5" />
                  ??????? ??? ??? ?? ????? ???
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
\;

fs.writeFileSync('app/shop/checkout/page.tsx', code);
