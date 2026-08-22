'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react'

type NewsPost = {
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
  initialPosts: NewsPost[]
}

export function NewsManager({ initialPosts }: Props) {
  const [posts, setPosts] = useState<NewsPost[]>(initialPosts)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnail_url: '',
    published: false
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleEdit = (post: NewsPost) => {
    setEditing(post.id)
    // Fetch full post data
    fetch(`/api/admin/news/${post.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          content: data.post.content,
          excerpt: data.post.excerpt || '',
          thumbnail_url: data.post.thumbnail_url || '',
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
      const url = editing === 'new' ? '/api/admin/news' : `/api/admin/news/${editing}`
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
    if (!confirm('این خبر حذف شود؟')) return

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const togglePublished = async (post: NewsPost) => {
    try {
      const response = await fetch(`/api/admin/news/${post.id}`, {
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

  if (editing) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <h2 className="text-2xl font-bold mb-6">
          {editing === 'new' ? 'خبر جدید' : 'ویرایش خبر'}
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
              placeholder="my-news-post"
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
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">تصویر شاخص (URL)</label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              dir="ltr"
            />
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
        <h2 className="text-2xl font-bold">مدیریت اخبار</h2>
        <button onClick={handleNew} className="button button-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          خبر جدید
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>خبری موجود نیست</p>
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
