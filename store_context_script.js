const fs = require('fs');

const code = \'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = {
  id: string
  store_item_id: string
  quantity: number
  title?: string
  price_cents?: number
  discount_price_cents?: number | null
  thumbnail_url?: string | null
  is_digital?: boolean
}

type CartContextType = {
  items: CartItem[]
  selectedItemIds: string[]
  setSelectedItemIds: (ids: string[]) => void
  toggleSelection: (id: string) => void
  toggleAll: () => void
  addToCart: (store_item_id: string, quantity?: number) => Promise<void>
  updateQuantity: (cart_item_id: string, quantity: number) => Promise<void>
  removeFromCart: (cart_item_id: string) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
  isDrawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  totalItems: number
  totalPrice: number
  selectedTotalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
        
        // Select all by default on first load
        if (!hasInitializedSelection && data.length > 0) {
          setSelectedItemIds(data.map((i: any) => i.id))
          setHasInitializedSelection(true)
        } else {
          // If a new item was added that isn't in items yet, auto-select it
          setSelectedItemIds(prev => {
            const newSelections = [...prev]
            let changed = false
            data.forEach((i: any) => {
              // If we've never seen this item before in our items state, select it!
              if (!items.find(oldItem => oldItem.id === i.id) && !newSelections.includes(i.id)) {
                newSelections.push(i.id)
                changed = true
              }
            })
            // Remove selections for items that no longer exist
            const validSelections = newSelections.filter(id => data.find((i: any) => i.id === id))
            return changed || validSelections.length !== prev.length ? validSelections : prev
          })
        }
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
      const res = await fetch(\/api/cart?cart_item_id=\\, { method: 'DELETE' })
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

  function toggleSelection(id: string) {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(items.map(i => i.id))
    }
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  
  const totalPrice = items.reduce((acc, item) => {
    const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
    return acc + (price * item.quantity)
  }, 0)

  const selectedTotalPrice = items
    .filter(item => selectedItemIds.includes(item.id))
    .reduce((acc, item) => {
      const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
      return acc + (price * item.quantity)
    }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        selectedItemIds,
        setSelectedItemIds,
        toggleSelection,
        toggleAll,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading,
        isDrawerOpen,
        setDrawerOpen,
        totalItems,
        totalPrice,
        selectedTotalPrice
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
\

fs.writeFileSync('lib/store-context.tsx', code);
