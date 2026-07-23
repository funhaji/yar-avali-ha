'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, LogOut } from 'lucide-react'

export function AccountControls() {
  const router = useRouter()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); setMessage('')
    if (form.newPassword !== form.confirmPassword) return setMessage('رمز جدید و تکرار آن یکسان نیستند.')
    setPending(true)
    const response = await fetch('/api/account/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json(); setPending(false); setMessage(data.message || data.error)
    if (response.ok) setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/'); router.refresh()
  }

  return <section className="account-panel" id="security"><div className="section-kicker"><KeyRound /> امنیت حساب</div><h2>رمزت را امن نگه دار</h2><p className="muted">برای تغییر رمز، رمز فعلی‌ات را هم وارد کن.</p><form onSubmit={changePassword} className="form-stack"><label>رمز فعلی<input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required /></label><label>رمز جدید<input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} minLength={8} required /></label><label>تکرار رمز جدید<input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} minLength={8} required /></label>{message && <p className="form-message" role="status">{message}</p>}<div className="button-row"><button className="button button-primary" disabled={pending}>{pending ? 'در حال ذخیره...' : 'تغییر رمز'}</button><button type="button" className="button button-danger" onClick={logout}><LogOut /> خروج از حساب</button></div></form></section>
}
