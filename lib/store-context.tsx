'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type CartItem = {
  id: string
  store_item_id: string
  quantity: number
  title?: string
  price_cents?: number
  discount_price_cents?: number | null
  thumbnail_url?: string | null
}

type CartContextType = {
  items: CartItem[]
  addToCart: (store_item_id: string, quantity?: number) => Promise<void>
  updateQuantity: (cart_item_id: string, quantity: number) => Promise<void>
  removeFromCart: (cart_item_id: string) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
  isDrawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to fetch cart', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function addToCart(store_item_id: string, quantity = 1) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_item_id, quantity })
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      if (res.ok) {
        await fetchCart()
        setDrawerOpen(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function updateQuantity(cart_item_id: string, quantity: number) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id, quantity })
      })
      if (res.ok) await fetchCart()
    } finally {
      setIsLoading(false)
    }
  }

  async function removeFromCart(cart_item_id: string) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/cart?cart_item_id=${cart_item_id}`, { method: 'DELETE' })
      if (res.ok) await fetchCart()
    } finally {
      setIsLoading(false)
    }
  }

  async function clearCart() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/cart?clear_all=true', { method: 'DELETE' })
      if (res.ok) await fetchCart()
    } finally {
      setIsLoading(false)
    }
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce((acc, item) => {
    const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
    return acc + (price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading,
        isDrawerOpen,
        setDrawerOpen,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
