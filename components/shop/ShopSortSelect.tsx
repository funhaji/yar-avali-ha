'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ShopSortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('sort', e.target.value)
    router.push(`/shop?${newParams.toString()}`)
  }

  return (
    <select 
      name="sort" 
      defaultValue={defaultValue}
      onChange={handleChange}
      className="px-4 py-3 rounded-full border border-line-soft bg-cream focus:bg-paper focus:outline-none focus:border-teal transition-all text-sm font-bold"
    >
      <option value="newest">جدیدترین</option>
      <option value="price_asc">ارزان‌ترین</option>
      <option value="price_desc">گران‌ترین</option>
    </select>
  )
}
