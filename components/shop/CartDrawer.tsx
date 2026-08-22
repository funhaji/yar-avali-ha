'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store-context'
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeFromCart, totalPrice, totalItems, isLoading } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  if (!isDrawerOpen) return null

  async function handleCheckout() {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'سفارش از سبد خرید' })
      })
      if (res.ok) {
        setCheckoutSuccess(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] fade-in"
        onClick={() => setDrawerOpen(false)}
      />
      <div className="fixed top-0 bottom-0 left-0 w-full md:w-[400px] bg-paper shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-out slide-up" style={{ animationName: 'slide-in-left' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        `}} />
        
        <div className="flex items-center justify-between p-5 border-b border-line-soft bg-cream">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShoppingBag className="w-5 h-5 text-teal" />
            سبد خرید
            <span className="badge badge-tangerine text-xs">{totalItems}</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="icon-button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="animate-spin w-8 h-8 text-teal" />
            </div>
          ) : checkoutSuccess ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center slide-up gap-4">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center text-teal-deep">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl">سفارشت با موفقیت ثبت شد! 🎉</h3>
                <p className="text-ink-soft mt-2">جزئیاتش برات پیامک میشه.</p>
              </div>
              <button onClick={() => { setCheckoutSuccess(false); setDrawerOpen(false) }} className="button button-primary mt-4">
                بستن
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center text-ink-soft gap-4">
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p>سبدت خالیه.</p>
              <Link href="/shop" onClick={() => setDrawerOpen(false)} className="button button-primary mt-2">
                برو به فروشگاه
              </Link>
            </div>
          ) : (
            items.map(item => {
              const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
              return (
                <div key={item.id} className="flex gap-4 p-3 border border-line-soft rounded-xl bg-cream/50 slide-up">
                  <div className="w-20 h-20 bg-paper rounded-lg overflow-hidden shrink-0 border border-line-soft">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-soft"><ShoppingBag className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 py-1">
                    <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                    <div className="text-teal-deep font-bold text-sm mt-1">{price / 10} تومان</div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-paper border border-line-soft rounded-lg overflow-hidden">
                        <button disabled={isLoading} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-cream active:bg-line-soft transition-colors text-ink-soft">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button disabled={isLoading} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-cream active:bg-line-soft transition-colors text-ink-soft">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button disabled={isLoading} onClick={() => removeFromCart(item.id)} className="text-berry p-1 hover:bg-berry/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {items.length > 0 && !checkoutSuccess && !isLoading && (
          <div className="p-5 bg-cream border-t border-line-soft">
            <div className="flex items-center justify-between font-bold text-lg mb-4">
              <span>جمع کل:</span>
              <span className="text-teal-deep">{totalPrice / 10} تومان</span>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={checkoutLoading}
              className="button button-primary w-full justify-center button-lg shadow-lg hover:shadow-xl"
            >
              {checkoutLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'نهایی کردن خرید'} 
              {!checkoutLoading && <ArrowLeft className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
