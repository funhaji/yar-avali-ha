'use client'

import { ShoppingBag, Loader2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/store-context'
import type { StoreItem } from '@/lib/store'
import { useState } from 'react'

export function AddToCartButton({ product }: { product: StoreItem }) {
  const { addToCart, items, updateQuantity, isLoading } = useCart()
  const [adding, setAdding] = useState(false)

  const cartItem = items.find(i => i.store_item_id === product.id)
  const isOutOfStock = product.stock_quantity === 0 && !product.is_digital
  const maxReached = product.stock_quantity !== null && cartItem && cartItem.quantity >= product.stock_quantity

  async function handleAdd() {
    if (adding || isOutOfStock || maxReached || (product.is_digital && cartItem)) return
    
    setAdding(true)
    await addToCart(product.id, 1)
    setAdding(false)
  }

  if (cartItem && product.is_digital) {
    return (
      <button disabled className="button button-lg bg-teal/10 text-teal-deep border-none cursor-default font-bold">
        تو سبدته
      </button>
    )
  }

  if (cartItem && !product.is_digital) {
    return (
      <div className="flex items-center gap-3 bg-cream border border-line-soft p-1 rounded-full w-full sm:w-48">
        <button 
          onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
          disabled={isLoading}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-paper active:bg-line-soft transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="flex-1 text-center font-bold text-lg">{cartItem.quantity}</span>
        <button 
          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
          disabled={isLoading || !!maxReached}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-paper active:bg-line-soft transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={handleAdd}
      disabled={adding || isOutOfStock || isLoading}
      className="button button-primary button-lg shadow-lg hover:shadow-xl w-full sm:w-auto sm:min-w-[200px] justify-center text-[1.05rem]"
    >
      {adding || isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
      {isOutOfStock ? 'تموم شده' : 'بذار تو سبد'}
    </button>
  )
}
