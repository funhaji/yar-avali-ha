'use client'

import { useState } from 'react'
import { Plus, Trash2, Upload, Save, MoveUp, MoveDown, Eye, EyeOff } from 'lucide-react'

type Slide = {
  id: string
  image_url: string
  title: string | null
  link_url: string | null
  display_order: number
  is_active: boolean
}

type Props = {
  initialSlides: Slide[]
}

export function SliderManager({ initialSlides }: Props) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  // New slide form
  const [newSlide, setNewSlide] = useState({
    image_url: '',
    title: '',
    link_url: ''
  })

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setNewSlide(prev => ({ ...prev, image_url: data.url }))
        setMessage('تصویر با موفقیت آپلود شد')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('خطا در آپلود تصویر')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('خطا در آپلود تصویر')
    } finally {
      setUploading(false)
    }
  }

  const handleAddSlide = async () => {
    if (!newSlide.image_url) {
      alert('لطفاً تصویر را آپلود کنید')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: newSlide.image_url,
          title: newSlide.title || null,
          link_url: newSlide.link_url || null,
          display_order: slides.length
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSlides([...slides, data.slide])
        setNewSlide({ image_url: '', title: '', link_url: '' })
        setIsAdding(false)
        setMessage('اسلاید با موفقیت اضافه شد')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('خطا در افزودن اسلاید')
      }
    } catch (error) {
      console.error('Add slide error:', error)
      setMessage('خطا در افزودن اسلاید')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('آیا از حذف این اسلاید مطمئن هستید؟')) return

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSlides(slides.filter(s => s.id !== id))
        setMessage('اسلاید حذف شد')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('خطا در حذف اسلاید')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (response.ok) {
        setSlides(slides.map(s => s.id === id ? { ...s, is_active: !isActive } : s))
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const newSlides = [...slides]
    const temp = newSlides[index]
    newSlides[index] = newSlides[index - 1]
    newSlides[index - 1] = temp
    setSlides(newSlides)
    await updateOrder(newSlides)
  }

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return
    const newSlides = [...slides]
    const temp = newSlides[index]
    newSlides[index] = newSlides[index + 1]
    newSlides[index + 1] = temp
    setSlides(newSlides)
    await updateOrder(newSlides)
  }

  const updateOrder = async (orderedSlides: Slide[]) => {
    try {
      await fetch('/api/admin/slider/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: orderedSlides.map((s, i) => ({ id: s.id, display_order: i }))
        })
      })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Slides */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-2xl font-bold">اسلایدهای فعلی</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="button button-primary"
            style={{ fontSize: '.9rem' }}
          >
            <Plus style={{ width: 18 }} />
            افزودن اسلاید
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('موفقیت') || message.includes('حذف') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {slides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            هیچ اسلایدی وجود ندارد. یکی اضافه کنید!
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="border border-gray-300 rounded-lg p-4"
                style={{ opacity: slide.is_active ? 1 : 0.5 }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  {/* Thumbnail */}
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'اسلاید'}
                    className="w-32 h-20 object-cover rounded"
                  />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '.5rem' }}>
                      {slide.title || 'بدون عنوان'}
                    </div>
                    {slide.link_url && (
                      <div style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginBottom: '.5rem' }}>
                        لینک: {slide.link_url}
                      </div>
                    )}
                    <div style={{ fontSize: '.8rem', color: 'var(--ink-soft)' }}>
                      ترتیب: {index + 1}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleToggleActive(slide.id, slide.is_active)}
                      className="button button-ghost"
                      style={{ padding: '.5rem', fontSize: '.85rem' }}
                      title={slide.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                      {slide.is_active ? <Eye style={{ width: 16 }} /> : <EyeOff style={{ width: 16 }} />}
                    </button>
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="button button-ghost"
                      style={{ padding: '.5rem', fontSize: '.85rem' }}
                      title="انتقال به بالا"
                    >
                      <MoveUp style={{ width: 16 }} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === slides.length - 1}
                      className="button button-ghost"
                      style={{ padding: '.5rem', fontSize: '.85rem' }}
                      title="انتقال به پایین"
                    >
                      <MoveDown style={{ width: 16 }} />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="button button-ghost"
                      style={{ padding: '.5rem', fontSize: '.85rem', color: 'var(--berry)' }}
                      title="حذف"
                    >
                      <Trash2 style={{ width: 16 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Slide Form */}
      {isAdding && (
        <div className="card" style={{ padding: '2rem', border: '2px solid var(--teal-deep)' }}>
          <h3 className="text-xl font-bold mb-4">افزودن اسلاید جدید</h3>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block font-medium mb-2">تصویر اسلاید *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <input
                  type="url"
                  value={newSlide.image_url}
                  onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                  placeholder="URL تصویر"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  style={{ direction: 'ltr' }}
                />
                <div>
                  <label
                    htmlFor="slide-upload"
                    className="button button-ghost"
                    style={{ cursor: 'pointer' }}
                  >
                    {uploading ? (
                      <>
                        <Upload className="animate-spin" style={{ width: 16 }} />
                        در حال آپلود...
                      </>
                    ) : (
                      <>
                        <Upload style={{ width: 16 }} />
                        آپلود تصویر
                      </>
                    )}
                  </label>
                  <input
                    id="slide-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </div>
                {newSlide.image_url && (
                  <img
                    src={newSlide.image_url}
                    alt="پیش‌نمایش"
                    className="w-full max-w-md h-48 object-cover rounded"
                  />
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-medium mb-2">عنوان (اختیاری)</label>
              <input
                type="text"
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                placeholder="عنوانی که روی تصویر نمایش داده می‌شود"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                style={{ direction: 'rtl' }}
              />
            </div>

            {/* Link */}
            <div>
              <label className="block font-medium mb-2">لینک (اختیاری)</label>
              <input
                type="url"
                value={newSlide.link_url}
                onChange={(e) => setNewSlide({ ...newSlide, link_url: e.target.value })}
                placeholder="https://example.com/page"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                style={{ direction: 'ltr' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAddSlide}
                disabled={saving || !newSlide.image_url}
                className="button button-primary"
              >
                <Save style={{ width: 18 }} />
                {saving ? 'در حال ذخیره...' : 'ذخیره اسلاید'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewSlide({ image_url: '', title: '', link_url: '' })
                }}
                className="button button-ghost"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
