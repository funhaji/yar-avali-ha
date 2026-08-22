'use client'

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Eye, EyeOff, FileVideo, ImagePlus, Info, Pencil, Play, Plus, Search, Trash2, UploadCloud, X } from 'lucide-react'
import type { ContentItem } from '@/lib/content'

type ContentForm = {
  id: string
  title: string
  title_en: string
  description: string
  content_type: string
  tier_requirement: string
  age_tag: string
  grade_level: string
  category: string
  genre: string
  series_title: string
  episode_number: string
  duration_minutes: string
  video_url: string
  pixeldrain_id: string
  thumbnail_url: string
  file_size_bytes: string
  published: boolean
  storage_provider: string
  r2_key: string
  gdrive_id: string
}

const emptyForm: ContentForm = {
  id: '',
  title: '',
  title_en: '',
  description: '',
  content_type: 'lesson',
  tier_requirement: 'free',
  age_tag: '',
  grade_level: '',
  category: '',
  genre: '',
  series_title: '',
  episode_number: '',
  duration_minutes: '',
  video_url: '',
  pixeldrain_id: '',
  thumbnail_url: '',
  file_size_bytes: '',
  published: true,
  storage_provider: 'pixeldrain',
  r2_key: '',
  gdrive_id: '',
}

const contentTypes = [
  { value: 'lesson', label: 'درس' },
  { value: 'reading', label: 'روان‌خوانی' },
  { value: 'movie', label: 'فیلم' },
  { value: 'anime', label: 'قسمت سریال/انیمه' },
  { value: 'pdf', label: 'PDF / سند' },
  { value: 'image', label: 'تصویر' },
]

const grades = [
  { value: '', label: 'بدون پایه' },
  { value: 'class-1', label: 'کلاس اول' },
  { value: 'class-2', label: 'کلاس دوم' },
  { value: 'class-3', label: 'کلاس سوم' },
]

export function ContentManager({ initialItems }: { initialItems: ContentItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState<ContentForm>(emptyForm)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPDF, setUploadingPDF] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [contentTypeView, setContentTypeView] = useState<'all' | 'lessons' | 'worksheets'>('all')

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    let filtered = items.filter((item) => {
      const matchesType = typeFilter === 'all' || item.content_type === typeFilter
      const matchesSearch = !needle || [item.title, item.description, item.category, item.series_title, item.genre].some((value) => value?.toLowerCase().includes(needle))
      return matchesType && matchesSearch
    })

    // Apply content type view filter (lessons/worksheets)
    if (contentTypeView === 'lessons') {
      filtered = filtered.filter((item) => item.content_type === 'lesson' || item.content_type === 'reading')
    } else if (contentTypeView === 'worksheets') {
      filtered = filtered.filter((item) => item.content_type === 'pdf' || item.content_type === 'image')
    }

    return filtered
  }, [items, search, typeFilter, contentTypeView])

  function setField(key: keyof ContentForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function reset() {
    setForm(emptyForm)
    setEditing(false)
    setMessage(null)
  }

  function edit(item: ContentItem) {
    setForm({
      id: item.id,
      title: item.title,
      title_en: item.title_en || '',
      description: item.description || '',
      content_type: item.content_type || 'lesson',
      tier_requirement: item.tier_requirement || 'free',
      age_tag: item.age_tag || '',
      grade_level: item.grade_level || '',
      category: item.category || '',
      genre: item.genre || '',
      series_title: item.series_title || '',
      episode_number: item.episode_number ? String(item.episode_number) : '',
      duration_minutes: item.duration_seconds ? String(Math.round(item.duration_seconds / 60)) : '',
      video_url: item.video_url || '',
      pixeldrain_id: item.pixeldrain_id || '',
      thumbnail_url: item.thumbnail_url || '',
      file_size_bytes: item.file_size_bytes ? String(item.file_size_bytes) : '',
      published: item.published,
      storage_provider: (item as any).storage_provider || 'pixeldrain',
      r2_key: (item as any).r2_key || '',
      gdrive_id: (item as any).gdrive_id || '',
    })
    setEditing(true)
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function uploadThumbnail(file: File) {
    setUploading(true)
    setMessage(null)
    const body = new FormData()
    body.append('file', file)
    body.append('kind', 'thumbnail')

    try {
      const response = await fetch('/api/admin/content/upload', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'آپلود انجام نشد.')
      setField('thumbnail_url', data.url)
      setMessage({ type: 'ok', text: 'تصویر شاخص آپلود شد.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در آپلود' })
    } finally {
      setUploading(false)
    }
  }

  async function uploadPDF(file: File) {
    setUploadingPDF(true)
    setMessage(null)
    const body = new FormData()
    body.append('file', file)
    body.append('kind', 'pdf')

    try {
      const response = await fetch('/api/admin/content/upload', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'آپلود PDF انجام نشد.')
      
      // Store both the URL and filename
      setField('video_url', data.url)
      setForm((current) => ({ ...current, pdf_filename: file.name }))
      setMessage({ type: 'ok', text: `PDF آپلود شد: ${file.name}` })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در آپلود PDF' })
    } finally {
      setUploadingPDF(false)
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    const pixeldrainId = extractPixeldrainId(form.pixeldrain_id) || extractPixeldrainId(form.video_url)
    const directVideoUrl = pixeldrainId ? '' : form.video_url
    const payload = {
      ...form,
      episode_number: form.episode_number ? Number(form.episode_number) : null,
      duration_seconds: form.duration_minutes ? Number(form.duration_minutes) * 60 : null,
      file_size_bytes: form.file_size_bytes ? Number(form.file_size_bytes) : null,
      video_url: directVideoUrl,
      pixeldrain_id: pixeldrainId,
    }

    try {
      const response = await fetch('/api/admin/content', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ذخیره انجام نشد.')

      setItems((current) => editing ? current.map((item) => (item.id === data.item.id ? data.item : item)) : [data.item, ...current])
      setMessage({ type: 'ok', text: data.message || 'محتوا ذخیره شد.' })
      if (!editing) setForm(emptyForm)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در ذخیره' })
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(item: ContentItem) {
    const response = await fetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    })
    const data = await response.json()
    if (response.ok) setItems((current) => current.map((currentItem) => currentItem.id === item.id ? data.item : currentItem))
  }

  async function remove(id: string) {
    if (!confirm('این محتوا حذف شود؟')) return
    const response = await fetch('/api/admin/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (response.ok) {
      setItems((current) => current.filter((item) => item.id !== id))
      if (form.id === id) reset()
    }
  }

  return (
    <div className="content-manager-layout">
      <section className="card account-panel">
        <span className="section-kicker"><Plus /> {editing ? 'ویرایش محتوا' : 'افزودن محتوا'}</span>
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <label>عنوان فارسی<input value={form.title} onChange={(event) => setField('title', event.target.value)} required /></label>
            <label>عنوان انگلیسی <small className="muted">اختیاری</small><input dir="ltr" value={form.title_en} onChange={(event) => setField('title_en', event.target.value)} /></label>
          </div>
          <label>توضیح کوتاه <small className="muted">اختیاری</small><textarea rows={3} value={form.description} onChange={(event) => setField('description', event.target.value)} /></label>
          <div className="form-grid">
            <label>نوع محتوا<select value={form.content_type} onChange={(event) => setField('content_type', event.target.value)}>{contentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
            <label>دسترسی<select value={form.tier_requirement} onChange={(event) => setField('tier_requirement', event.target.value)}><option value="free">رایگان</option><option value="premium">اشتراکی</option></select></label>
            <label>پایه<select value={form.grade_level} onChange={(event) => setField('grade_level', event.target.value)}>{grades.map((grade) => <option key={grade.value} value={grade.value}>{grade.label}</option>)}</select></label>
            {form.content_type !== 'pdf' && form.content_type !== 'image' && (
              <label>سن/برچسب<input value={form.age_tag} onChange={(event) => setField('age_tag', event.target.value)} placeholder="مثلاً ۷ تا ۹ سال" /></label>
            )}
          </div>
          <div className="form-grid">
            <div>
              <label>دسته بندی<input value={form.category} onChange={(event) => setField('category', event.target.value)} placeholder="مثلاً: لوحه نویسی، علوم..." /></label>
              {form.content_type !== 'pdf' && form.content_type !== 'image' && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', alignSelf: 'center' }}>پیشنهادی:</span>
                  {['لوحه نویسی', 'نشانه های ۱/۲', 'علوم', 'سایر'].map(cat => (
                    <button type="button" key={cat} onClick={() => setField('category', cat)} className="chip" style={{ cursor: 'pointer', background: form.category === cat ? 'var(--teal)' : 'var(--cream)', color: form.category === cat ? 'white' : 'inherit', border: '1px solid var(--line-soft)' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.content_type !== 'pdf' && form.content_type !== 'image' && (
              <>
                <label>ژانر<input value={form.genre} onChange={(event) => setField('genre', event.target.value)} placeholder="کمدی، آموزشی، ماجراجویی..." /></label>
                <label>نام مجموعه<input value={form.series_title} onChange={(event) => setField('series_title', event.target.value)} placeholder="برای انیمه/سریال" /></label>
                <label>شماره قسمت<input type="number" min="1" value={form.episode_number} onChange={(event) => setField('episode_number', event.target.value)} /></label>
              </>
            )}
          </div>
          
          {/* Video-specific fields (hide for PDF/Image) */}
          {form.content_type !== 'pdf' && form.content_type !== 'image' && (
            <>
              <div className="form-grid">
                <label>مدت ویدیو (دقیقه)<input type="number" min="0" value={form.duration_minutes} onChange={(event) => setField('duration_minutes', event.target.value)} /></label>
                <label>نوع منبع ویدیو<select value={form.storage_provider || 'pixeldrain'} onChange={(event) => setField('storage_provider', event.target.value)}><option value="pixeldrain">Pixeldrain</option><option value="youtube">YouTube (نیاز به VPN)</option><option value="gdrive">Google Drive</option><option value="mega">Mega.nz</option><option value="r2">Cloudflare R2</option><option value="direct">لینک مستقیم</option></select></label>
              </div>
              
              {(form.storage_provider === 'pixeldrain' || !form.storage_provider) && (
                <label>لینک یا شناسه Pixeldrain<input dir="ltr" value={form.pixeldrain_id} onChange={(event) => setField('pixeldrain_id', event.target.value)} placeholder="https://pixeldrain.com/u/abc123 یا abc123" /></label>
              )}
              
              {form.storage_provider === 'youtube' && (
                <>
                  <label>لینک YouTube (Unlisted یا Public)<input type="url" dir="ltr" value={form.video_url} onChange={(event) => setField('video_url', event.target.value)} placeholder="https://youtu.be/abc123 یا https://www.youtube.com/watch?v=abc123" /></label>
                  <div className="form-note" style={{ background: '#fff3cd', borderColor: '#ffc107' }}>
                    <Info aria-hidden="true" style={{ color: '#856404' }} />
                    <div>
                      <b style={{ color: '#856404' }}>⚠️ هشدار: YouTube نیاز به VPN دارد</b>
                      <p className="muted" style={{ color: '#856404' }}>کاربران و ادمین‌ها برای دسترسی به YouTube باید از VPN استفاده کنند. ویدیو مستقیماً از YouTube پخش می‌شود و ترافیک از Vercel عبور نمی‌کند.</p>
                    </div>
                  </div>
                </>
              )}
              
              {form.storage_provider === 'gdrive' && (
                <>
                  <label>شناسه فایل Google Drive<input dir="ltr" value={form.gdrive_id} onChange={(event) => setField('gdrive_id', event.target.value)} placeholder="1a2b3c4d5e6f7g8h9i" /></label>
                  <div className="form-note" style={{ background: '#e7f3ff', borderColor: '#2196f3' }}>
                    <Info aria-hidden="true" style={{ color: '#1976d2' }} />
                    <div>
                      <b style={{ color: '#1976d2' }}>📋 راهنمای گام به گام Google Drive</b>
                      <ol className="muted" style={{ color: '#424242', marginTop: '0.5rem', paddingRight: '1.2rem' }}>
                        <li><strong>آپلود ویدیو:</strong> فایل ویدیو را در Google Drive خود آپلود کنید</li>
                        <li><strong>اشتراک‌گذاری:</strong> روی فایل کلیک راست کنید → «Share» یا «اشتراک‌گذاری» را انتخاب کنید</li>
                        <li><strong>عمومی کردن:</strong> روی «Restricted» کلیک کنید → گزینه «Anyone with the link» را انتخاب کنید</li>
                        <li><strong>تنظیم دسترسی:</strong> مطمئن شوید که «Viewer» (بیننده) انتخاب شده است</li>
                        <li><strong>کپی لینک:</strong> دکمه «Copy link» را بزنید - لینک شما شبیه این است:<br/><code dir="ltr" style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em' }}>https://drive.google.com/file/d/YOUR_FILE_ID/view</code></li>
                        <li><strong>استخراج شناسه:</strong> فقط قسمت بین <code>/d/</code> و <code>/view</code> را کپی کنید (مثال: <code>1a2b3c4d5e6f7g8h9i</code>)</li>
                        <li><strong>Done:</strong> شناسه را در فیلد بالا وارد کنید</li>
                      </ol>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>✅ ویدیو مستقیماً از Google Drive پخش می‌شود (بدون مصرف ترافیک سرور)</p>
                    </div>
                  </div>
                </>
              )}
              
              {form.storage_provider === 'mega' && (
                <>
                  <label>لینک Mega.nz<input type="url" dir="ltr" value={form.video_url} onChange={(event) => setField('video_url', event.target.value)} placeholder="https://mega.nz/file/abc123xyz#key" /></label>
                  <div className="form-note" style={{ background: '#fff3e0', borderColor: '#ff9800' }}>
                    <Info aria-hidden="true" style={{ color: '#f57c00' }} />
                    <div>
                      <b style={{ color: '#f57c00' }}>📋 راهنمای گام به گام Mega.nz</b>
                      <ol className="muted" style={{ color: '#424242', marginTop: '0.5rem', paddingRight: '1.2rem' }}>
                        <li><strong>ثبت‌نام/ورود:</strong> به <a href="https://mega.nz" target="_blank" style={{ color: '#f57c00' }}>mega.nz</a> بروید و وارد حساب خود شوید (20GB رایگان)</li>
                        <li><strong>آپلود ویدیو:</strong> دکمه «Upload» را بزنید و فایل ویدیو خود را آپلود کنید</li>
                        <li><strong>دریافت لینک:</strong> روی فایل کلیک راست کنید → گزینه «Get link» یا «دریافت لینک» را انتخاب کنید</li>
                        <li><strong>کپی کردن:</strong> لینک کامل را کپی کنید - لینک شبیه این است:<br/><code dir="ltr" style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em' }}>https://mega.nz/file/abc123xyz#defgh456</code></li>
                        <li><strong>Done:</strong> لینک کامل را در فیلد بالا وارد کنید</li>
                      </ol>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
                        ✅ ویدیو مستقیماً از Mega پخش می‌شود (بدون مصرف ترافیک سرور)<br/>
                        ✅ 20GB فضای رایگان | رمزنگاری end-to-end | سرعت بالا
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {form.storage_provider === 'r2' && (
                <>
                  <label>کلید فایل در Cloudflare R2<input dir="ltr" value={form.r2_key} onChange={(event) => setField('r2_key', event.target.value)} placeholder="videos/lesson-1.mp4" /></label>
                  <div className="form-note">
                    <Info aria-hidden="true" />
                    <div>
                      <b>Cloudflare R2 Storage</b>
                      <p className="muted">فایل باید قبلاً در R2 bucket آپلود شده باشد. کلید فایل را وارد کنید. ویدیو مستقیماً از R2 پخش می‌شود و ترافیک از Vercel عبور نمی‌کند.</p>
                    </div>
                  </div>
                </>
              )}
              
              {form.storage_provider === 'direct' && (
                <>
                  <label>لینک مستقیم ویدیو<input type="url" dir="ltr" value={form.video_url} onChange={(event) => setField('video_url', event.target.value)} placeholder="https://example.com/video.mp4" /></label>
                  <small className="muted">لینک مستقیم به فایل ویدیو (باید دسترسی CORS داشته باشد)</small>
                </>
              )}
              
              <div className="form-note">
                <Info aria-hidden="true" />
                <div>
                  <b>راهنمای انتخاب منبع</b>
                  <p className="muted">
                    • <b>Pixeldrain:</b> رایگان، برای لینک دانلود خوب است (اما iframe رایگان محدود است)<br />
                    • <b>YouTube:</b> رایگان و قدرتمند، نیاز به VPN دارد (برای کاربر و ادمین)<br />
                    • <b>Google Drive:</b> رایگان، مناسب برای فایل‌های کوچک تا متوسط<br />
                    • <b>Cloudflare R2:</b> سریع و ارزان، نیاز به تنظیمات دارد<br />
                    • <b>لینک مستقیم:</b> برای سرورهای خودتان
                  </p>
                </div>
              </div>
            </>
          )}
          
          {/* PDF/Image Upload Section */}
          {form.content_type === 'pdf' && (
            <>
              <div className="form-note" style={{ background: '#f3e5f5', borderColor: '#9c27b0' }}>
                <Info aria-hidden="true" style={{ color: '#7b1fa2' }} />
                <div>
                  <b style={{ color: '#7b1fa2' }}>📄 لینک فایل PDF</b>
                  <p className="muted" style={{ color: '#424242' }}>
                    می‌توانید لینک Google Drive یا هر لینک مستقیم دیگری به فایل PDF خود وارد کنید. فایل با محافظت کامل در برابر کپی و چاپ نمایش داده می‌شود.
                  </p>
                </div>
              </div>
              <label>لینک فایل PDF<input type="url" dir="ltr" value={form.video_url} onChange={(event) => setField('video_url', event.target.value)} placeholder="https://drive.google.com/file/d/FILE_ID/view یا لینک مستقیم" /></label>
            </>
          )}
          
          {form.content_type === 'image' && (
            <>
              <div className="form-note" style={{ background: '#e3f2fd', borderColor: '#2196f3' }}>
                <Info aria-hidden="true" style={{ color: '#1976d2' }} />
                <div>
                  <b style={{ color: '#1976d2' }}>🖼️ لینک تصویر</b>
                  <p className="muted" style={{ color: '#424242' }}>
                    می‌توانید لینک Google Drive، Imgur یا هر لینک مستقیم دیگری به تصویر خود وارد کنید.
                  </p>
                </div>
              </div>
              <label>لینک فایل تصویر<input type="url" dir="ltr" value={form.video_url} onChange={(event) => setField('video_url', event.target.value)} placeholder="https://drive.google.com/uc?export=view&id=FILE_ID یا لینک مستقیم" /></label>
            </>
          )}
          <div className="upload-row">
            <label className="button button-ghost"><ImagePlus /> {uploading ? 'در حال آپلود تصویر...' : 'آپلود تصویر شاخص'}<input type="file" accept="image/*" hidden disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadThumbnail(event.target.files[0])} /></label>
          </div>
          <label>لینک تصویر شاخص<input type="url" dir="ltr" value={form.thumbnail_url} onChange={(event) => setField('thumbnail_url', event.target.value)} placeholder="https://example.com/thumb.jpg" /></label>
          {form.thumbnail_url && <img src={form.thumbnail_url} alt="پیش‌نمایش تصویر شاخص" className="content-thumb-preview" />}
          <label className="toggle-line"><input type="checkbox" checked={form.published} onChange={(event) => setField('published', event.target.checked)} /> انتشار در سایت</label>
          {message && <div className={message.type === 'ok' ? 'alert-ok' : 'alert-error'} role="status">{message.text}</div>}
          <div className="button-row">
            <button className="button button-primary" disabled={saving || uploading}><UploadCloud /> {saving ? 'در حال ذخیره...' : editing ? 'ذخیره تغییرات' : 'افزودن به سایت'}</button>
            {editing && <button type="button" className="button button-ghost" onClick={reset}><X /> انصراف</button>}
          </div>
        </form>
      </section>

      <section className="card account-panel">
        <div className="content-list-head">
          <div>
            <span className="section-kicker"><FileVideo /> کتابخانه محتوا</span>
            <h2 className="section-title" style={{ fontSize: '1.7rem' }}>{items.length} محتوا</h2>
          </div>
          <div className="content-filters">
            <label><Search /> <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو" /></label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">همه نوع‌ها</option>
              {contentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
        </div>
        
        {/* Content Type View Tabs (Lessons vs Worksheets) */}
        <div className="content-type-tabs" style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          borderBottom: '2px solid var(--line-soft)',
          paddingBottom: '0.5rem'
        }}>
          <button
            className={`tab-button ${contentTypeView === 'all' ? 'active' : ''}`}
            onClick={() => setContentTypeView('all')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: contentTypeView === 'all' ? 'var(--teal)' : 'transparent',
              color: contentTypeView === 'all' ? 'var(--paper)' : 'var(--ink)',
              fontWeight: 700,
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            همه محتوا
          </button>
          <button
            className={`tab-button ${contentTypeView === 'lessons' ? 'active' : ''}`}
            onClick={() => setContentTypeView('lessons')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: contentTypeView === 'lessons' ? 'var(--teal)' : 'transparent',
              color: contentTypeView === 'lessons' ? 'var(--paper)' : 'var(--ink)',
              fontWeight: 700,
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            درس‌ها
          </button>
          <button
            className={`tab-button ${contentTypeView === 'worksheets' ? 'active' : ''}`}
            onClick={() => setContentTypeView('worksheets')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: contentTypeView === 'worksheets' ? 'var(--teal)' : 'transparent',
              color: contentTypeView === 'worksheets' ? 'var(--paper)' : 'var(--ink)',
              fontWeight: 700,
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            کاربرگ‌ها
          </button>
        </div>
        <div className="content-admin-list">
          {filteredItems.map((item) => (
            <article key={item.id} className="content-admin-row">
              <div className="content-admin-thumb">{item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} /> : <Play />}</div>
              <div>
                <b>{item.title}</b>
                <p className="muted">{labelForType(item.content_type)} {item.category ? `- ${item.category}` : ''}</p>
                <div className="lesson-tags">
                  <span className={`chip ${item.tier_requirement === 'free' ? 'chip-free' : 'chip-lock'}`}>{item.tier_requirement === 'free' ? 'رایگان' : 'اشتراکی'}</span>
                  {item.published ? <span className="chip chip-teal">منتشر شده</span> : <span className="chip">پیش‌نویس</span>}
                  {item.series_title && <span className="chip">{item.series_title}</span>}
                </div>
              </div>
              <div className="content-admin-actions">
                {item.published && <Link className="icon-button" aria-label="تماشا" href={`/watch/${item.id}`}><Play /></Link>}
                <button className="icon-button" aria-label="ویرایش" onClick={() => edit(item)}><Pencil /></button>
                <button className="icon-button" aria-label={item.published ? 'عدم انتشار' : 'انتشار'} onClick={() => togglePublished(item)}>{item.published ? <EyeOff /> : <Eye />}</button>
                <button className="icon-button" aria-label="حذف" onClick={() => remove(item.id)}><Trash2 /></button>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 && <div className="empty-state"><FileVideo /><h3>محتوایی پیدا نشد</h3><p className="muted">فیلترها را تغییر بده یا محتوای تازه اضافه کن.</p></div>}
        </div>
      </section>
    </div>
  )
}

function labelForType(type: string) {
  return contentTypes.find((item) => item.value === type)?.label || type
}

function extractPixeldrainId(value: string) {
  const text = value.trim()
  if (!text) return ''
  const match = text.match(/pixeldrain\.com\/(?:u|api\/file)\/([a-zA-Z0-9_-]+)/)
  if (match?.[1]) return match[1]
  if (!text.includes('/') && !text.includes('.')) return text
  return ''
}
