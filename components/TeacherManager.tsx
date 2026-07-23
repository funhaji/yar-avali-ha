'use client'

import { useState } from 'react'
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'

interface Teacher { id: string; name: string; specialty: string | null; bio: string | null; photo_url: string | null; display_order: number; is_visible: boolean }
const empty = { id: '', name: '', specialty: '', bio: '', photo_url: '', display_order: 0, is_visible: true }

export function TeacherManager({ initial }: { initial: Teacher[] }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initial)
  const [form, setForm] = useState<any>(empty)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() { setForm(empty); setEditing(false); setError('') }

  async function upload(file: File) {
    setUploading(true); setError('')
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const d = await r.json(); setUploading(false)
    if (!r.ok) return setError(d.error || 'خطا در آپلود')
    setForm((f: any) => ({ ...f, photo_url: d.url }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const method = editing ? 'PUT' : 'POST'
    const r = await fetch('/api/admin/teachers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json(); setSaving(false)
    if (!r.ok) return setError(d.error || 'خطا در ذخیره')
    setTeachers((list) => editing ? list.map(t => t.id === d.teacher.id ? d.teacher : t) : [...list, d.teacher])
    reset()
  }

  async function remove(id: string) {
    if (!confirm('این معلم حذف شود؟')) return
    await fetch('/api/admin/teachers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setTeachers((list) => list.filter(t => t.id !== id))
  }

  async function toggle(t: Teacher) {
    const updated = { ...t, is_visible: !t.is_visible }
    const r = await fetch('/api/admin/teachers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
    const d = await r.json(); if (r.ok) setTeachers((list) => list.map(x => x.id === d.teacher.id ? d.teacher : x))
  }

  return (
    <div style={{ display: 'grid', gap: '1.6rem', gridTemplateColumns: '1fr', alignItems: 'start' }}>
      <section className="card account-panel">
        <div className="section-kicker"><Plus /> {editing ? 'ویرایش معلم' : 'افزودن معلم'}</div>
        <form onSubmit={save} className="form-stack">
          <label>نام<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
          <label>تخصص <small className="muted">مثلاً معلم ریاضی</small><input value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })} /></label>
          <label>معرفی کوتاه<textarea rows={3} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} /></label>
          <label>ترتیب نمایش<input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /></label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '.6rem' }}><input type="checkbox" style={{ width: 'auto' }} checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} /> نمایش در صفحه اصلی</label>
          <div>
            <span style={{ fontWeight: 700, display: 'block', marginBottom: '.5rem' }}>عکس معلم</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {form.photo_url && <img src={form.photo_url || "/placeholder.svg"} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 14, border: '2.5px solid var(--line)' }} />}
              <label className="button button-ghost" style={{ cursor: 'pointer' }}><ImagePlus /> {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}<input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>
            </div>
          </div>
          {error && <div className="alert-error">{error}</div>}
          <div className="button-row">
            <button className="button button-primary" disabled={saving || uploading}>{saving ? 'در حال ذخیره...' : editing ? 'ذخیره تغییرات' : 'افزودن معلم'}</button>
            {editing && <button type="button" className="button button-ghost" onClick={reset}><X /> انصراف</button>}
          </div>
        </form>
      </section>

      <section>
        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>معلم‌های ثبت‌شده ({teachers.length})</h2>
        {teachers.length === 0 ? <div className="card" style={{ padding: '2rem', textAlign: 'center' }}><p className="muted">هنوز معلمی اضافه نشده است.</p></div> : (
          <div className="teacher-grid">
            {teachers.map(t => (
              <article key={t.id} className="card teacher-card" style={{ opacity: t.is_visible ? 1 : .55 }}>
                {t.photo_url ? <img src={t.photo_url || "/placeholder.svg"} alt={t.name} className="teacher-photo" /> : <div className="teacher-photo" style={{ display: 'grid', placeItems: 'center' }}><ImagePlus /></div>}
                <div className="teacher-body">
                  <h3 className="teacher-name">{t.name}</h3>
                  {t.specialty && <span className="chip teacher-specialty">{t.specialty}</span>}
                  <div className="button-row" style={{ marginTop: '.6rem' }}>
                    <button className="icon-button" aria-label="ویرایش" onClick={() => { setForm({ ...t, specialty: t.specialty || '', bio: t.bio || '', photo_url: t.photo_url || '' }); setEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Pencil /></button>
                    <button className="icon-button" aria-label="نمایش" onClick={() => toggle(t)}>{t.is_visible ? <Eye /> : <EyeOff />}</button>
                    <button className="icon-button" aria-label="حذف" onClick={() => remove(t.id)}><Trash2 /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
