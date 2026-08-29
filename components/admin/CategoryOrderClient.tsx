'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown, Save, Store, FileText } from 'lucide-react'

type OrderData = {
  categories: string[]
  subcategories: Record<string, string[]>
}

export function CategoryOrderClient({ initialShopOrder, initialBlogOrder }: { initialShopOrder: OrderData, initialBlogOrder: OrderData }) {
  const [shopOrder, setShopOrder] = useState<OrderData>(initialShopOrder)
  const [blogOrder, setBlogOrder] = useState<OrderData>(initialBlogOrder)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const moveItem = (arr: string[], index: number, dir: -1 | 1) => {
    if (index + dir < 0 || index + dir >= arr.length) return arr;
    const newArr = [...arr];
    const temp = newArr[index];
    newArr[index] = newArr[index + dir];
    newArr[index + dir] = temp;
    return newArr;
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const payload = {
        settings: [
          { key: 'shop_cat_order', value: JSON.stringify(shopOrder.categories), type: 'json' },
          { key: 'shop_subcat_order', value: JSON.stringify(shopOrder.subcategories), type: 'json' },
          { key: 'blog_cat_order', value: JSON.stringify(blogOrder.categories), type: 'json' },
          { key: 'blog_subcat_order', value: JSON.stringify(blogOrder.subcategories), type: 'json' },
        ]
      }
      
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        setMessage('تنظیمات با موفقیت ذخیره شد.')
      } else {
        setMessage('خطا در ذخیره تنظیمات.')
      }
    } catch (e) {
      setMessage('خطا در ارتباط با سرور.')
    }
    setSaving(false)
  }

  const OrderList = ({ items, onMove }: { items: string[], onMove: (idx: number, dir: -1|1) => void }) => {
    if (!items || items.length === 0) return <div className="text-ink-soft text-sm p-4 bg-cream/50 rounded-lg border border-line-soft border-dashed">موردی یافت نشد.</div>
    return (
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={item} className="flex items-center justify-between bg-paper border border-line-soft p-3 rounded-lg shadow-sm">
            <span className="font-bold text-ink">{item}</span>
            <div className="flex gap-1">
              <button 
                onClick={() => onMove(idx, -1)} 
                disabled={idx === 0}
                className="p-1 rounded hover:bg-cream disabled:opacity-30 transition-colors text-ink-soft hover:text-teal"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onMove(idx, 1)} 
                disabled={idx === items.length - 1}
                className="p-1 rounded hover:bg-cream disabled:opacity-30 transition-colors text-ink-soft hover:text-teal"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* SHOP */}
      <section className="bg-cream border border-line-soft rounded-2xl p-6">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-teal-deep">
          <Store className="w-6 h-6" /> فروشگاه
        </h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-ink">دسته‌بندی‌های اصلی</h3>
          <OrderList 
            items={shopOrder.categories} 
            onMove={(idx, dir) => setShopOrder(prev => ({ ...prev, categories: moveItem(prev.categories, idx, dir) }))} 
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold mb-4 text-ink">زیردسته‌ها</h3>
          {shopOrder.categories.map(cat => (
            <div key={cat} className="mr-4 pl-4 border-r-2 border-line-soft">
              <h4 className="font-bold text-teal mb-3">{cat}</h4>
              <OrderList 
                items={shopOrder.subcategories[cat] || []} 
                onMove={(idx, dir) => setShopOrder(prev => ({ 
                  ...prev, 
                  subcategories: { ...prev.subcategories, [cat]: moveItem(prev.subcategories[cat], idx, dir) }
                }))} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section className="bg-cream border border-line-soft rounded-2xl p-6">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-teal-deep">
          <FileText className="w-6 h-6" /> وبلاگ
        </h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-ink">دسته‌بندی‌های اصلی</h3>
          <OrderList 
            items={blogOrder.categories} 
            onMove={(idx, dir) => setBlogOrder(prev => ({ ...prev, categories: moveItem(prev.categories, idx, dir) }))} 
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold mb-4 text-ink">زیردسته‌ها</h3>
          {blogOrder.categories.map(cat => (
            <div key={cat} className="mr-4 pl-4 border-r-2 border-line-soft">
              <h4 className="font-bold text-teal mb-3">{cat}</h4>
              <OrderList 
                items={blogOrder.subcategories[cat] || []} 
                onMove={(idx, dir) => setBlogOrder(prev => ({ 
                  ...prev, 
                  subcategories: { ...prev.subcategories, [cat]: moveItem(prev.subcategories[cat], idx, dir) }
                }))} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* SAVE BUTTON */}
      <div className="sticky bottom-6 bg-paper border border-line-soft rounded-2xl p-4 shadow-xl flex items-center justify-between z-20">
        <div>
          {message && (
            <span className={`font-bold px-4 py-2 rounded-lg ${message.includes('خطا') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </span>
          )}
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="button button-primary"
        >
          {saving ? 'در حال ذخیره...' : <><Save className="w-5 h-5" /> ذخیره تغییرات</>}
        </button>
      </div>
    </div>
  )
}
