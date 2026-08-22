'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import type { StoreItem } from '@/lib/store'
import { ProductCard } from './ProductCard'

export function ShopGrid({ items, category, search }: { items: StoreItem[], category: string, search: string }) {
  const [displayed, setDisplayed] = useState(30)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Reset pagination when items change (e.g. user applied a filter)
  useEffect(() => {
    setDisplayed(30)
  }, [items])

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (displayed >= items.length) return

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        setDisplayed(prev => Math.min(prev + 30, items.length))
      }
    }, { threshold: 0.1 })

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [displayed, items.length])

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center text-ink-soft flex flex-col items-center justify-center min-h-[400px]">
        <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="text-xl font-bold mb-2">نتیجه‌ای پیدا نشد!</h3>
        <p>با این فیلترها و جستجو محصولی پیدا نکردیم.</p>
        {(category !== 'all' || search !== '') && (
          <Link href="/shop" className="button button-primary mt-6">
            دیدن همه محصولات
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {items.slice(0, displayed).map((item, i) => (
          <div key={item.id} className={`stagger-${(i % 5) + 1}`}>
            <ProductCard product={item} />
          </div>
        ))}
      </div>
      
      {displayed < items.length && (
        <div ref={loaderRef} className="py-12 flex justify-center items-center">
          <div className="w-8 h-8 rounded-full border-4 border-line-soft border-t-teal animate-spin"></div>
        </div>
      )}
    </>
  )
}
