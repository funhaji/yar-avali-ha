'use client'

import { useState } from 'react'
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'

interface Teacher { 
  id: string; name: string; specialty: string | null; bio: string | null; photo_url: string | null; video_url: string | null; display_order: number; is_visible: boolean;
  education?: string | null; location?: string | null; workplace?: string | null; experience_years?: number | null;
  national_rank?: number | null; provincial_rank?: number | null; district_rank?: number | null;
  contact_phone?: string | null; telegram_id?: string | null; whatsapp_id?: string | null; eitaa_id?: string | null; instagram_id?: string | null;
}
const empty = { 
  id: '', name: '', specialty: '', bio: '', photo_url: '', video_url: '', display_order: 0, is_visible: true,
  education: '', location: '', workplace: '', experience_years: '', national_rank: '', provincial_rank: '', district_rank: '',
  contact_phone: '', telegram_id: '', whatsapp_id: '', eitaa_id: '', instagram_id: ''
}

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
    let d; try { d = await r.json(); } catch(e) { setSaving(false); return setError('???? ????: ' + r.statusText); }; setSaving(false)
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
          <label>نام <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
          <label>تخصص <small className="muted">مثلا: معلم پایه اول</small><input value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })} /></label>
          <label>مدرک تحصیلی <small className="muted">مثلا: دکتری</small><input value={form.education || ''} onChange={e => setForm({ ...form, education: e.target.value })} /></label>
          <label>استان و شهر <small className="muted">مثلا: استان خوزستان شهر اهواز</small><input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
          <label>محل خدمت <small className="muted">مثلا: مدرسه علامه طباطبایی</small><input value={form.workplace || ''} onChange={e => setForm({ ...form, workplace: e.target.value })} /></label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>سابقه کار (سال) <input type="number" value={form.experience_years || ''} onChange={e => setForm({ ...form, experience_years: e.target.value ? Number(e.target.value) : '' })} /></label>
            <label>رتبه کشوری <input type="number" value={form.national_rank || ''} onChange={e => setForm({ ...form, national_rank: e.target.value ? Number(e.target.value) : '' })} /></label>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>رتبه استانی <input type="number" value={form.provincial_rank || ''} onChange={e => setForm({ ...form, provincial_rank: e.target.value ? Number(e.target.value) : '' })} /></label>
            <label>رتبه ناحیه <input type="number" value={form.district_rank || ''} onChange={e => setForm({ ...form, district_rank: e.target.value ? Number(e.target.value) : '' })} /></label>
          </div>

          <label>شماره تماس <small className="muted">مثلا: 09123456789</small><input value={form.contact_phone || ''} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>آیدی تلگرام <input value={form.telegram_id || ''} onChange={e => setForm({ ...form, telegram_id: e.target.value })} /></label>
            <label>آیدی ایتا <input value={form.eitaa_id || ''} onChange={e => setForm({ ...form, eitaa_id: e.target.value })} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>آیدی اینستاگرام <input value={form.instagram_id || ''} onChange={e => setForm({ ...form, instagram_id: e.target.value })} /></label>
            <label>شماره واتساپ <input value={form.whatsapp_id || ''} onChange={e => setForm({ ...form, whatsapp_id: e.target.value })} /></label>
          </div>

          <label>درباره معلم <textarea rows={3} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} /></label>
          <label>ترتیب نمایش <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /></label>
          <label>لینک ویدیو معرفی (اختیاری) <input type="url" placeholder="مثال: https://www.aparat.com/v/..." value={form.video_url || ''} onChange={e => setForm({ ...form, video_url: e.target.value })} /></label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '.6rem' }}><input type="checkbox" style={{ width: 'auto' }} checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} /> نمایش در سایت</label>
          <div>
            <span style={{ fontWeight: 700, display: 'block', marginBottom: '.5rem' }}>عکس معلم</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {form.photo_url && <img src={form.photo_url} alt="پروفایل" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />}
              <label className="button button-ghost" style={{ cursor: 'pointer' }}>
                {uploading ? 'در حال آپلود...' : 'انتخاب عکس'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} />
              </label>
            </div>
          </div>
          {error && <div className="note error">{error}</div>}
          <div className="button-row">
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? '...' : 'ذخیره'}</button>
            {editing && <button type="button" className="button button-ghost" onClick={reset}>انصراف</button>}
          </div>
        </form>
      </section>

      <section>
        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>معلم‌های ثبت‌شده ({teachers.length})</h2>
        {teachers.length === 0 ? <div className="card" style={{ padding: '2rem', textAlign: 'center' }}><p className="muted">هنوز معلمی اضافه نشده است.</p></div> : (
          <div className="teacher-grid">
            {teachers.map(t => (
              <article key={t.id} className="card teacher-card" style={{ opacity: t.is_visible ? 1 : 0.6 }}>
                {t.photo_url ? <img src={t.photo_url || "/placeholder.svg"} alt={t.name} className="teacher-photo" /> : <div className="teacher-photo" style={{ display: 'grid', placeItems: 'center' }}><ImagePlus /></div>}
                <div className="teacher-body">
                  <h3 className="teacher-name">{t.name}</h3>
                  {t.specialty && <span className="chip teacher-specialty">{t.specialty}</span>}
                  <div className="button-row" style={{ marginTop: '.6rem' }}>
                    <button className="icon-button" aria-label="ویرایش" onClick={() => { setForm({ ...t, specialty: t.specialty || '', bio: t.bio || '', photo_url: t.photo_url || '', video_url: t.video_url || '', education: t.education || '', location: t.location || '', workplace: t.workplace || '', experience_years: t.experience_years || '', national_rank: t.national_rank || '', provincial_rank: t.provincial_rank || '', district_rank: t.district_rank || '', contact_phone: t.contact_phone || '', telegram_id: t.telegram_id || '', whatsapp_id: t.whatsapp_id || '', eitaa_id: t.eitaa_id || '', instagram_id: t.instagram_id || '' }); setEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Pencil /></button>
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
