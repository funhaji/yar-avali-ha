'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Plus, Trash2, Loader2, Upload } from 'lucide-react'

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    setLoading(true)
    const res = await fetch('/api/admin/gallery')
    if (res.ok) {
      const data = await res.json()
      setImages(data.images)
    }
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      // 1. Upload to vercel blob
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', 'image')
      
      const uploadRes = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()
      
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')
      
      // 2. Save to db
      const dbRes = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, image_url: uploadData.url })
      })
      
      if (dbRes.ok) {
        setTitle('')
        setFile(null)
        fetchImages()
      }
    } catch (err) {
      console.error(err)
      alert('خطا در آپلود عکس')
    }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('آیا از حذف این عکس اطمینان دارید؟')) return
    await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' })
    fetchImages()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ImageIcon className="text-teal" /> مدیریت گالری تصاویر
        </h1>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">افزودن عکس جدید</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">عنوان (اختیاری)</label>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="مثلا: جشن شروع سال تحصیلی"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">فایل عکس</label>
            <input 
              type="file" 
              accept="image/*"
              className="input w-full" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <button type="submit" className="button button-primary" disabled={uploading || !file}>
            {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
            آپلود عکس
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-teal" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map(img => (
            <div key={img.id} className="card relative group overflow-hidden bg-line-soft aspect-square">
              <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="w-8 h-8 bg-berry text-paper rounded-full flex items-center justify-center self-end hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {img.title && <p className="text-paper text-sm font-medium truncate">{img.title}</p>}
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full p-12 text-center text-ink-soft">
              عکسی در گالری وجود ندارد
            </div>
          )}
        </div>
      )}
    </div>
  )
}
