'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldCheck, UserMinus, UserPlus } from 'lucide-react'

type AdminUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  active_subscription_until: string | null
}

export function AdminUserManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [pending, setPending] = useState(false)
  const [promotingId, setPromotingId] = useState('')
  const [demotingId, setDemotingId] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  function updateForm(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createAdmin(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'خطا در ساخت ادمین')

      setUsers((current) => [data.user, ...current])
      setForm({ name: '', email: '', phone: '', password: '' })
      setMessage({ type: 'ok', text: data.message || 'ادمین جدید ساخته شد.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در برقراری ارتباط' })
    } finally {
      setPending(false)
    }
  }

  async function promoteUser(id: string) {
    setPromotingId(id)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'promote' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'خطا در ادمین کردن کاربر')

      setUsers((current) => current.map((user) => (user.id === id ? { ...user, role: 'admin' } : user)))
      setMessage({ type: 'ok', text: data.message || 'کاربر ادمین شد.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در برقراری ارتباط' })
    } finally {
      setPromotingId('')
    }
  }

  async function demoteAdmin(id: string) {
    if (!confirm('آیا مطمئنید که می‌خواهید نقش ادمین این کاربر را حذف کنید؟')) {
      return
    }

    setDemotingId(id)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'demote' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'خطا در حذف نقش ادمین')

      setUsers((current) => current.map((user) => (user.id === id ? { ...user, role: 'user' } : user)))
      setMessage({ type: 'ok', text: data.message || 'نقش ادمین حذف شد.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در برقراری ارتباط' })
    } finally {
      setDemotingId('')
    }
  }

  return (
    <div className="user-admin-grid">
      <section className="card account-panel">
        <span className="section-kicker"><UserPlus /> ادمین تازه</span>
        <h2 className="section-title" style={{ fontSize: '1.7rem' }}>ساخت حساب ادمین</h2>
        <p className="muted form-intro">این حساب از همان لحظه اول به پنل مدیریت دسترسی دارد.</p>
        {message && <div className={message.type === 'ok' ? 'alert-ok' : 'alert-error'} role="status">{message.text}</div>}
        <form onSubmit={createAdmin} className="form-stack" style={{ marginTop: '1rem' }}>
          <label>نام و نام خانوادگی<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required /></label>
          <label>ایمیل<input type="email" dir="ltr" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required /></label>
          <label>شماره تلفن <small className="muted">اختیاری</small><input type="tel" dir="ltr" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} /></label>
          <label>رمز عبور<input type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} minLength={8} required /><small className="muted">حداقل ۸ کاراکتر، شامل حرف و عدد</small></label>
          <button className="button button-primary" disabled={pending}>{pending ? 'در حال ساخت...' : 'ساخت ادمین'}</button>
        </form>
      </section>

      <section className="card account-panel">
        <span className="section-kicker"><ShieldCheck /> کاربران و نقش‌ها</span>
        <h2 className="section-title" style={{ fontSize: '1.7rem' }}>ارتقای کاربران موجود</h2>
        <div className="user-list">
          {users.map((user) => (
            <div className="data-row" key={user.id}>
              <div>
                <b>{user.name}</b>
                <p className="muted ltr" style={{ fontSize: '.88rem' }}>{user.email}</p>
                {user.active_subscription_until && <p className="muted" style={{ fontSize: '.84rem' }}>اشتراک فعال دارد</p>}
              </div>
              <div className="user-row-actions">
                <span className={`role-pill ${user.role === 'admin' ? 'role-pill-admin' : ''}`}>
                  {user.role === 'admin' && <CheckCircle2 aria-hidden="true" />}
                  {user.role === 'admin' ? 'ادمین' : 'کاربر'}
                </span>
                {user.role === 'admin' ? (
                  <button className="button button-danger" onClick={() => demoteAdmin(user.id)} disabled={demotingId === user.id}>
                    <UserMinus aria-hidden="true" />
                    {demotingId === user.id ? 'در حال حذف...' : 'حذف ادمین'}
                  </button>
                ) : (
                  <button className="button button-secondary" onClick={() => promoteUser(user.id)} disabled={promotingId === user.id}>
                    {promotingId === user.id ? 'در حال ارتقا...' : 'ادمین کن'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
