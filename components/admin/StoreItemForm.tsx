'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Image as ImageIcon, Loader2, ArrowRight, Trash2, Upload, Info } from 'lucide-react'
import type { StoreItem } from '@/lib/store'
import Link from 'next/link'

function extractPixeldrainId(value: string) {
  const text = value.trim()
  if (!text) return ''
  const match = text.match(/pixeldrain\.com\/(?:u|api\/file)\/([a-zA-Z0-9_-]+)/)
  if (match?.[1]) return match[1]
  if (!text.includes('/') && !text.includes('.')) return text
  return ''
}

function UploadField({ name, label, kind, defaultValue, placeholder }: { name: string, label: string, kind: string, defaultValue?: string, placeholder?: string }) {
  const [val, setVal] = useState(defaultValue || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', kind)
    try {
      const res = await fetch('/api/admin/content/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطا در آپلود')
      setVal(data.url)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label>{label}</label>
      <div className="flex gap-2 mt-1">
        <input name={name} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} dir="ltr" className="flex-1" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="button button-ghost whitespace-nowrap bg-white border border-line-soft shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'آپلود...' : 'انتخاب فایل'}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  )
}


function MultipleFileUpload({ name, label, kind, defaultValue }: { name: string, label: string, kind: string, defaultValue?: string }) {
  const [urls, setUrls] = useState<string[]>(defaultValue ? defaultValue.split(',').filter(Boolean) : [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    const newUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData()
      fd.append('file', files[i])
      fd.append('kind', kind)
      try {
        const res = await fetch('/api/admin/content/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) newUrls.push(data.url)
      } catch (err) {
        console.error(err)
      }
    }
    
    setUrls([...urls, ...newUrls])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <label>{label}</label>
      <input type="hidden" name={name} value={urls.join(',')} />
      
      <div className="flex flex-col gap-2">
        {urls.map((url, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-paper p-2 rounded-xl border border-line-soft">
            <input value={url} onChange={e => {
              const newArr = [...urls];
              newArr[idx] = e.target.value;
              setUrls(newArr);
            }} className="flex-1 text-sm bg-transparent border-none" dir="ltr" />
            <button type="button" onClick={() => setUrls(urls.filter((_, i) => i !== idx))} className="text-berry p-2 hover:bg-berry/10 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="button button-ghost bg-white border border-line-soft w-full justify-center">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'در حال آپلود...' : 'انتخاب یک یا چند فایل'}
        </button>
        <button type="button" onClick={() => setUrls([...urls, ''])} className="button button-ghost border border-line-soft shrink-0">
          + افزودن دستی
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
      </div>
    </div>
  )
}

function GalleryUpload({ initialImages = [] }: { initialImages?: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    const newUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'thumbnail')
      try {
        const res = await fetch('/api/admin/content/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) newUrls.push(data.url)
      } catch (err) {
        console.error(err)
      }
    }
    
    setImages([...images, ...newUrls])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label>گالری تصاویر</label>
      <input type="hidden" name="images" value={images.join(',')} />
      
      <div className="flex flex-wrap gap-4 mt-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl border border-line-soft overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-ink/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-24 h-24 rounded-xl border-2 border-dashed border-line-soft flex flex-col items-center justify-center text-ink-soft hover:bg-cream hover:border-teal transition-colors">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 mb-1" />}
          <span className="text-xs">{uploading ? 'آپلود...' : 'اضافه کردن'}</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
      </div>
    </div>
  )
}

export function StoreItemForm({ initialData, defaultCategory, existingCategories = [], existingSubcategories = [] }: { initialData?: StoreItem, defaultCategory?: string, existingCategories?: string[], existingSubcategories?: string[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [isDigital, setIsDigital] = useState(initialData?.is_digital || false)
  const [contentType, setContentType] = useState(initialData?.content_type || 'pdf')
  const [storageProvider, setStorageProvider] = useState(initialData?.storage_provider || 'pixeldrain')

  const [isShowcase, setIsShowcase] = useState(initialData ? (initialData.price_cents === null || initialData.price_cents === undefined) : false)
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || defaultCategory || '')

  const isEditing = !!initialData && !!initialData.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const formData = new FormData(e.currentTarget)
    
    // Parse numeric/boolean fields
    const priceCents = isShowcase ? null : (parseInt(formData.get('price_cents') as string) * 10 || 0)
    const discountStr = formData.get('discount_price_cents') as string
    const discountPriceCents = discountStr ? parseInt(discountStr) * 10 : null
    const stockStr = formData.get('stock_quantity') as string
    const stockQuantity = stockStr ? parseInt(stockStr) : null
    const displayOrder = parseInt(formData.get('display_order') as string) || 0
    
    const isFree = formData.get('is_free') === 'on'
    const isDownloadable = formData.get('is_downloadable') === 'on'
    const isPublished = formData.get('is_published') === 'on'

    const tagsStr = formData.get('tags') as string
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : null

    const imagesStr = formData.get('images') as string
    const images = imagesStr ? imagesStr.split(',').filter(Boolean) : null

    const rawPixeldrainId = formData.get('pixeldrain_id') as string || ''
    const videoUrl = formData.get('video_url') as string || ''
    
    const pixeldrainId = extractPixeldrainId(rawPixeldrainId) || extractPixeldrainId(videoUrl)
    const directVideoUrl = pixeldrainId ? '' : videoUrl

    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      price_cents: priceCents,
      discount_price_cents: discountPriceCents,
      stock_quantity: stockQuantity,
      is_digital: isDigital,
      is_free: isFree,
      is_downloadable: isDownloadable,
      is_published: isPublished,
      display_order: displayOrder,
      thumbnail_url: formData.get('thumbnail_url') || null,
      video_url: formData.get('teaser_video_url') || null,
      images,
      category: formData.get('category') || null,
      subcategory: formData.get('subcategory') || null,
      tags,
      content_type: isDigital ? contentType : null,
      storage_provider: isDigital ? storageProvider : null,
      pixeldrain_id: isDigital && storageProvider === 'pixeldrain' ? pixeldrainId : null,
      gdrive_id: isDigital && storageProvider === 'gdrive' ? formData.get('gdrive_id') : null,
      r2_key: isDigital && storageProvider === 'r2' ? formData.get('r2_key') : null,
      file_url: isDigital ? (directVideoUrl || formData.get('file_url') || null) : null
    }

    try {
      const url = isEditing ? `/api/admin/store/${initialData.id}` : '/api/admin/store'
      const method = isEditing ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('خطا در ذخیره محصول')
      
      setMessage('✅ محصول با موفقیت ذخیره شد!')
      setTimeout(() => {
        router.push('/admin/store')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm('آیا از حذف این محصول مطمئن هستید؟')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/store/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('خطا در حذف')
      
      router.push('/admin/store')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-3xl slide-up">
      <div className="p-6 border-b border-line-soft bg-cream flex justify-between items-center">
        <h2 className="font-bold text-lg">{isEditing ? 'ویرایش محصول' : 'اضافه کردن محصول جدید'}</h2>
        <Link href="/admin/store" className="button button-ghost text-sm">
          <ArrowRight className="w-4 h-4" /> برگشت
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 form-stack">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label>عنوان محصول *
              <input name="title" required defaultValue={initialData?.title} placeholder="مثلاً: کتاب فارسی اول دبستان" />
            </label>
          </div>
            <div>
              <label>دسته بندی
                <input 
                  name="category" 
                  list="category-list"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  placeholder="مثال: کتاب، اسباب بازی..." 
                />
                <datalist id="category-list">
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </label>
            </div>
            <div>
              <label>زیردسته بندی (اختیاری)
                <input 
                  name="subcategory" 
                  list="subcategory-list"
                  defaultValue={initialData?.subcategory || ''} 
                  placeholder="مثال: اول دبستان" 
                />
                <datalist id="subcategory-list">
                  {existingSubcategories.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </label>
            </div>
        </div>

        <div>
          <label>توضیحات کامل محصول
            <textarea name="description" rows={4} defaultValue={initialData?.description || ''} placeholder="توضیحات کامل محصول رو اینجا بنویس..."></textarea>
          </label>
        </div>

        <div className="flex flex-col gap-4 p-4 bg-cream rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-line-soft rounded-lg bg-white shadow-sm">
            <input type="checkbox" checked={isShowcase} onChange={e => setIsShowcase(e.target.checked)} className="w-5 h-5 accent-teal" />
            <div className="flex flex-col">
              <span className="font-bold">فقط معرفی (غیرقابل فروش)</span>
              <span className="text-sm text-ink-soft">با انتخاب این گزینه، این محصول صرفا جهت معرفی نمایش داده می‌شود و قیمت یا دکمه خرید نخواهد داشت.</span>
            </div>
          </label>
          
          {!isShowcase && (
            <div className="grid md:grid-cols-3 gap-6 mt-2">
              <div>
                <label>قیمت (تومان) *
                  <input type="number" name="price_cents" required defaultValue={initialData?.price_cents ? initialData.price_cents / 10 : ''} min="0" />
                </label>
              </div>
              <div>
                <label>قیمت با تخفیف (تومان)
                  <input type="number" name="discount_price_cents" defaultValue={initialData?.discount_price_cents ? initialData.discount_price_cents / 10 : ''} min="0" />
                </label>
                <small className="text-ink-soft">اگر وارد کنید، محصول حراج می‌شود</small>
              </div>
              <div>
                <label>موجودی انبار
                  <input type="number" name="stock_quantity" defaultValue={initialData?.stock_quantity || ''} min="0" disabled={isDigital} />
                </label>
                <small className="text-ink-soft">برای محصولات دیجیتال نادیده گرفته می‌شود</small>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-4 bg-cream rounded-xl">
          <div>
            <label>اولویت نمایش (اختیاری)
              <input type="number" name="display_order" defaultValue={initialData?.display_order || 0} />
            </label>
            <small className="text-ink-soft">عدد بزرگتر = بالاتر قرار میگیره</small>
          </div>
          <div className="flex flex-col justify-center">
            <label className="flex flex-row items-center gap-3 cursor-pointer mt-4">
              <input type="checkbox" name="is_published" defaultChecked={initialData ? initialData.is_published : true} className="w-5 h-5 accent-teal" />
              <span>محصول منتشر بشه (تیک نداشته باشه مخفی میشه)</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 p-4 border border-line-soft rounded-xl bg-paper">
          <label className="flex flex-row items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_digital" checked={isDigital} onChange={(e) => setIsDigital(e.target.checked)} className="w-5 h-5 accent-teal" />
            <span>محصول دیجیتال است</span>
          </label>
          <label className="flex flex-row items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_free" defaultChecked={initialData?.is_free} className="w-5 h-5 accent-teal" />
            <span>رایگان است</span>
          </label>
          <label className="flex flex-row items-center gap-3 cursor-pointer opacity-50">
            <input type="checkbox" name="is_downloadable" defaultChecked={initialData?.is_downloadable} className="w-5 h-5 accent-teal" />
            <span>(فقط دانلود مستقیم فایل)</span>
          </label>
        </div>

        {/* Digital content upload options */}
        {isDigital && (
          <div className="p-6 border-2 border-dashed border-teal/30 rounded-xl bg-teal/5 flex flex-col gap-4">
            <h3 className="font-bold text-teal flex items-center gap-2"><ImageIcon className="w-5 h-5" /> تنظیمات محتوای دیجیتال</h3>
            <p className="text-sm text-teal-deep opacity-80 mb-2">کاربر بعد از خرید به این محتوا دسترسی پیدا می‌کنه.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <label>نوع محتوا
                <select value={contentType} onChange={e => setContentType(e.target.value)}>
                  <option value="video">ویدیو</option>
                  <option value="pdf">فایل PDF</option>
                  <option value="image">تصویر</option>
                  <option value="file">فایل فشرده / سایر</option>
                </select>
              </label>

              {contentType === 'video' && (
                <label>نوع منبع ویدیو
                  <select value={storageProvider} onChange={e => setStorageProvider(e.target.value)}>
                    <option value="pixeldrain">Pixeldrain</option>
                    <option value="youtube">YouTube (نیاز به VPN)</option>
                    <option value="gdrive">Google Drive</option>
                    <option value="mega">Mega.nz</option>
                    <option value="r2">Cloudflare R2</option>
                    <option value="direct">لینک مستقیم</option>
                  </select>
                </label>
              )}
            </div>

            {contentType === 'video' ? (
              <>
                {(storageProvider === 'pixeldrain') && (
                  <label>لینک یا شناسه Pixeldrain
                    <input dir="ltr" name="pixeldrain_id" defaultValue={initialData?.pixeldrain_id || ''} placeholder="https://pixeldrain.com/u/abc123" />
                  </label>
                )}
                {storageProvider === 'youtube' && (
                  <label>لینک YouTube
                    <input type="url" dir="ltr" name="video_url" defaultValue={initialData?.file_url || ''} placeholder="https://youtu.be/abc123" />
                  </label>
                )}
                {storageProvider === 'gdrive' && (
                  <label>شناسه فایل Google Drive
                    <input dir="ltr" name="gdrive_id" defaultValue={initialData?.gdrive_id || ''} placeholder="1a2b3c4d5e6f7g8h9i" />
                  </label>
                )}
                {storageProvider === 'mega' && (
                  <label>لینک Mega.nz
                    <input type="url" dir="ltr" name="video_url" defaultValue={initialData?.file_url || ''} placeholder="https://mega.nz/file/abc123xyz#key" />
                  </label>
                )}
                {storageProvider === 'r2' && (
                  <label>کلید فایل در R2
                    <input dir="ltr" name="r2_key" defaultValue={initialData?.r2_key || ''} placeholder="videos/product.mp4" />
                  </label>
                )}
                {storageProvider === 'direct' && (
                  <label>لینک مستقیم ویدیو
                    <input type="url" dir="ltr" name="video_url" defaultValue={initialData?.file_url || ''} placeholder="https://example.com/video.mp4" />
                  </label>
                )}
              </>
            ) : (
              <MultipleFileUpload 
                  name="file_url" 
                  label={`فایل محتوا (${contentType === 'pdf' ? 'چند PDF مجاز است' : 'فایل دیجیتال'})`}
                  kind="store_file" 
                  defaultValue={initialData?.file_url} 
                />
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 border-t border-line-soft pt-6 mt-2">
          <UploadField 
            name="thumbnail_url" 
            label="عکس اصلی محصول" 
            kind="thumbnail" 
            defaultValue={initialData?.thumbnail_url || ''} 
            placeholder="آپلود عکس یا لینک..." 
          />
        </div>

        <div className="mt-2">
          <GalleryUpload initialImages={initialData?.images || []} />
        </div>
        
        <div className="mt-4 border-t border-line-soft pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label>عکس‌های دیگر (با ویرگول جدا کنید)
                <input name="images" defaultValue={initialData?.images?.join(',') || ''} placeholder="https://..., https://..." />
              </label>
            </div>
            
            <div>
              <label>لینک ویدیو معرفی (آپارات و ...)
                <input name="teaser_video_url" dir="ltr" defaultValue={initialData?.video_url || ''} placeholder="https://www.aparat.com/v/..." />
              </label>
            </div>
          </div>
          <label>برچسب‌ها (با کاما جدا بشن)
            <input name="tags" defaultValue={initialData?.tags?.join(', ') || ''} placeholder="کودک, آموزشی, ریاضی" />
          </label>
        </div>

        {error && <div className="alert-error mt-4">{error}</div>}
        {message && <div className="alert-ok mt-4">{message}</div>}

        <div className="flex items-center justify-between pt-4 mt-6 border-t border-line-soft">
          <button type="submit" disabled={loading} className="button button-primary button-lg">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'ذخیره تغییرات' : 'اضافه کردن محصول'}
          </button>

          {isEditing && (
            <button type="button" onClick={handleDelete} disabled={loading} className="button button-danger">
              <Trash2 className="w-4 h-4" /> پاک کردن محصول
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
