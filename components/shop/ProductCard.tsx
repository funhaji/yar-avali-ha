'use client'

import Link from 'next/link'
import { ShoppingBag, Image as ImageIcon, Percent } from 'lucide-react'
import type { StoreItem } from '@/lib/store'
import { useCart } from '@/lib/store-context'
import { useState } from 'react'

export function ProductCard({ product }: { product: StoreItem }) {
  const { addToCart, items } = useCart()
  const [adding, setAdding] = useState(false)

  const hasDiscount = product.discount_price_cents !== null
  const price = hasDiscount ? product.discount_price_cents! : product.price_cents

  // If digital, they probably only need to buy one
  const inCart = items.find(i => i.store_item_id === product.id)
  const shouldDisableAdd = product.is_digital && inCart

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (shouldDisableAdd || adding) return
    
    setAdding(true)
    await addToCart(product.id, 1)
    setAdding(false)
  }

  return (
    <Link href={`/shop/${product.id}`} className="card hover-lift group relative bg-paper flex flex-col h-full overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {hasDiscount && product.price_cents > 0 && (
          <div className="badge badge-tangerine shadow-md font-bold" dir="ltr">
            {Math.round(((product.price_cents - product.discount_price_cents!) / product.price_cents) * 100)}% تخفیف
          </div>
        )}
        {product.is_free && (
          <div className="badge badge-sunflower shadow-md">رایگان</div>
        )}
        {product.stock_quantity === 0 && !product.is_digital && (
          <div className="badge bg-ink text-paper shadow-md">تموم شده</div>
        )}
      </div>

      <div className="relative aspect-square bg-cream overflow-hidden">
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.title} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft opacity-30 group-hover:scale-105 transition-transform duration-500">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}
        
        {/* Overlay Add to cart button (desktop mostly) */}
        {product.price_cents !== null && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/60 to-transparent translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-center">
            <button 
              onClick={handleAdd}
              disabled={adding || !!shouldDisableAdd || (product.stock_quantity === 0 && !product.is_digital)}
              className="button bg-paper text-teal-deep hover:bg-cream border-none shadow-lg w-full justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
              {shouldDisableAdd ? 'تو سبدته' : adding ? 'داره اضافه میشه...' : 'بذار تو سبد'}
            </button>
          </div>
        )}
      </div>
      
      <div className="p-3 md:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] md:text-xs font-bold text-ink-soft">{product.category || 'بدون دسته'}</span>
          <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-line-soft text-ink-soft">
            {product.is_digital ? 'دیجیتال' : 'فیزیکی'}
          </span>
        </div>
        
        <h3 className="font-bold text-sm md:text-lg mb-2 line-clamp-2 leading-snug group-hover:text-teal-deep transition-colors">
          {product.title}
        </h3>
        
        <div className="mt-auto pt-2 md:pt-4 flex items-end justify-between">
          <div>
            {product.price_cents === null ? (
              <span className="text-teal font-bold text-sm md:text-base">مشاهده جزئیات</span>
            ) : hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs text-ink-soft line-through mb-0.5">{product.price_cents / 10} تومان</span>
                <span className="font-bold text-teal-deep text-sm md:text-lg leading-none">{price / 10} تومان</span>
              </div>
            ) : (
              <span className="font-bold text-ink text-sm md:text-lg leading-none">{product.is_free ? 'رایگان' : (price / 10) + ' تومان'}</span>
            )}
          </div>
          
          {product.price_cents !== null && (
            <button 
              onClick={handleAdd}
              disabled={shouldDisableAdd || adding || (product.stock_quantity === 0 && !product.is_digital)}
              className={`icon-button w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 transition-colors shadow-sm
                ${shouldDisableAdd ? 'bg-green-100 text-green-700 border-green-200 cursor-not-allowed' : 
                  (product.stock_quantity === 0 && !product.is_digital) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                  'bg-teal text-white hover:bg-teal-deep hover:shadow-md border-transparent'}
              `}
              title={shouldDisableAdd ? 'در سبد خرید موجود است' : (product.stock_quantity === 0 && !product.is_digital) ? 'ناموجود' : 'افزودن به سبد'}
            >
              {adding ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : 
               shouldDisableAdd ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> :
               <Plus className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
