'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  published: boolean
  view_count: number
  created_at: string
  author_name?: string
}

type Props = {
  initialPosts: BlogPost[]
}

export function BlogManager({ initialPosts }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnail_url: '',
    images: [] as string[],
    video_url: '',
    video_provider: 'direct',
    redirect_url: '',
    published: false
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleEdit = (post: BlogPost) => {
    setEditing(post.id)
    // Fetch full post data
    fetch(`/api/admin/blog/${post.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          content: data.post.content,
          excerpt: data.post.excerpt || '',
          thumbnail_url: data.post.thumbnail_url || '',
          images: data.post.images || [],
          video_url: data.post.video_url || '',
          video_provider: data.post.video_provider || 'direct',
          redirect_url: data.post.redirect_url || '',
          published: data.post.published
        })
      })
  }

  const handleNew = () => {
    setEditing('new')
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      thumbnail_url: '',
      images: [] as string[],
      video_url: '',
      video_provider: 'direct',
      redirect_url: '',
      published: false
    })
  }

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      setMessage('عنوان، شناسه و محتوا الزامی است')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const url = editing === 'new' ? '/api/admin/blog' : `/api/admin/blog/${editing}`
      const method = editing === 'new' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        if (editing === 'new') {
          setPosts([data.post, ...posts])
        } else {
          setPosts(posts.map(p => p.id === editing ? data.post : p))
        }
        setEditing(null)
        setMessage('ذخیره شد')
      } else {
        const error = await response.json()
        setMessage(error.error || 'خطا در ذخیره')
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage('خطا در ذخیره')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('این پست حذف شود؟')) return

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const togglePublished = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published })
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(posts.map(p => p.id === post.id ? data.post : p))
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formDataData = new FormData()
    formDataData.append('file', file)
    formDataData.append('kind', 'thumbnail')
    
    try {
      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formDataData
      })
      const data = await res.json()
      if (data.url) {
        if (type === 'thumbnail') {
          setFormData({ ...formData, thumbnail_url: data.url })
        } else {
          setFormData({ ...formData, images: [...formData.images, data.url] })
        }
      }
    } catch (err) {
      console.error('Upload error', err)
    }
  }

  const removeGalleryImage = (index: number) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  if (editing) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <h2 className="text-2xl font-bold mb-6">
          {editing === 'new' ? 'پست جدید' : 'ویرایش پست'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">عنوان *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">شناسه URL (slug) *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="my-blog-post"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">خلاصه</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">محتوا *</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '\n\n[متن لینک](https://...)' })} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 text-gray-800">
                🔗 افزودن لینک
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '\n\n![توضیح تصویر](https://...)' })} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 text-gray-800">
                🖼️ افزودن تصویر در متن
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, content: formData.content + '\n\n**متن بولد**' })} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 text-gray-800">
                ضخیم
              </button>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">تصویر شاخص (URL یا آپلود)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="آدرس تصویر..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  dir="ltr"
                />
                <label className="button button-ghost cursor-pointer whitespace-nowrap">
                  آپلود
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} />
                </label>
              </div>
              {formData.thumbnail_url && (
                <img src={formData.thumbnail_url} alt="Thumbnail" className="mt-2 h-20 rounded object-cover" />
              )}
            </div>

            <div>
              <label className="block font-medium mb-2">منبع ویدیو (اختیاری)</label>
              <select
                value={formData.video_provider}
                onChange={(e) => setFormData({ ...formData, video_provider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              >
                <option value="direct">آدرس مستقیم (MP4)</option>
                <option value="pixeldrain">Pixeldrain (شناسه)</option>
                <option value="youtube">YouTube (شناسه)</option>
                <option value="gdrive">Google Drive (شناسه)</option>
                <option value="aparat">Aparat (شناسه یا اسکریپت)</option>
              </select>
              <input
                type="text"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder={formData.video_provider === 'direct' ? "https://.../video.mp4" : "شناسه ویدیو"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">لینک خارجی (Redirect URL)</label>
            <p className="text-sm text-gray-500 mb-2">اگر پر شود، کلیک روی این پست مستقیماً کاربر را به این آدرس منتقل می‌کند.</p>
            <input
              type="url"
              value={formData.redirect_url}
              onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 flex justify-between items-center">
              گالری تصاویر
              <label className="button button-ghost cursor-pointer text-sm py-1 px-3">
                <Plus className="w-4 h-4 inline" /> افزودن تصویر
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} />
              </label>
            </label>
            {formData.images.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Gallery ${i}`} className="h-24 w-24 object-cover rounded border" />
                    <button 
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm mt-1">عکسی اضافه نشده است.</div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-5 h-5"
              />
              <span>انتشار عمومی</span>
            </label>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes('خطا') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="button button-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="button button-ghost"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">مدیریت وبلاگ</h2>
        <button onClick={handleNew} className="button button-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          پست جدید
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>پستی موجود نیست</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{post.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{new Date(post.created_at).toLocaleDateString('fa-IR')}</span>
                  <span>•</span>
                  <span>{post.view_count} بازدید</span>
                  {post.author_name && (
                    <>
                      <span>•</span>
                      <span>{post.author_name}</span>
                    </>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {post.published ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="icon-button"
                  title="ویرایش"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePublished(post)}
                  className="icon-button"
                  title={post.published ? 'عدم انتشار' : 'انتشار'}
                >
                  {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="icon-button"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
