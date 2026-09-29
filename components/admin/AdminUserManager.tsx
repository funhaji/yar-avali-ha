'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle2, ShieldCheck, UserMinus, UserPlus, Search,
  X, Phone, Mail, Calendar, KeyRound, UserCheck, Users, ShieldAlert
} from 'lucide-react'

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
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [pending, setPending] = useState(false)
  const [promotingId, setPromotingId] = useState('')
  const [demotingId, setDemotingId] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  // Search & Filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'subscribed'>('all')

  function updateForm(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role & Subscription filter
      if (roleFilter === 'admin' && user.role !== 'admin') return false
      if (roleFilter === 'user' && user.role === 'admin') return false
      if (roleFilter === 'subscribed' && !user.active_subscription_until) return false

      // Search term filter (by name, email, phone, id)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        const matchName = user.name?.toLowerCase().includes(term)
        const matchEmail = user.email?.toLowerCase().includes(term)
        const matchPhone = user.phone?.includes(term)
        const matchId = user.id?.toLowerCase().includes(term)
        if (!matchName && !matchEmail && !matchPhone && !matchId) return false
      }

      return true
    })
  }, [users, searchTerm, roleFilter])

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
      setMessage({ type: 'ok', text: data.message || 'ادمین جدید با موفقیت ساخته شد.' })
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
      setMessage({ type: 'ok', text: data.message || 'کاربر به ادمین ارتقا یافت.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'خطا در برقراری ارتباط' })
    } finally {
      setPromotingId('')
    }
  }

  async function demoteAdmin(id: string) {
    if (!confirm('آیا مطمئنید که می‌خواهید دسترسی ادمین این کاربر را حذف کنید؟')) {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Create Admin Form */}
      <section className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-300 shadow-md flex flex-col gap-5 sticky top-24">
        <div className="border-b-2 border-slate-200 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal/10 text-teal-800 border border-teal/30 text-xs font-black mb-2">
            <UserPlus className="w-4 h-4 text-teal-700" />
            <span>ادمین تازه</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">ساخت حساب ادمین</h2>
          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
            این حساب بلافاصله پس از ایجاد، به تمامی بخش‌های پنل مدیریت دسترسی کامل خواهد داشت.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-2xl border-2 text-xs font-black transition-all ${
              message.type === 'ok'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
            role="status"
          >
            {message.text}
          </div>
        )}

        <form onSubmit={createAdmin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">نام و نام خانوادگی *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="مثال: رضا احمدی"
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">ایمیل ادمین *</label>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs text-left"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              شماره تلفن <span className="text-slate-500 font-normal">(اختیاری)</span>
            </label>
            <input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              placeholder="0912..."
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">کلمه عبور *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              minLength={8}
              placeholder="حداقل ۸ کاراکتر"
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
              required
            />
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              حداقل ۸ کاراکتر شامل حروف و اعداد
            </span>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-2xl bg-teal hover:bg-teal-deep border-2 border-teal-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{pending ? 'در حال ساخت حساب...' : 'ساخت حساب ادمین'}</span>
          </button>
        </form>
      </section>

      {/* RIGHT: User Directory & Search */}
      <section className="lg:col-span-8 flex flex-col gap-6">
        {/* Search & Filter Header Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-300 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal" />
                <span>لیست و جستجوی کاربران ({users.length})</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                جستجو در نام، ایمیل، شماره تلفن و شناسه کاربری
              </p>
            </div>

            <div className="text-xs font-black text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-xl border-2 border-slate-300 shadow-xs">
              نمایش <span className="text-teal-700 font-black">{filteredUsers.length}</span> از {users.length}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با نام، نام کاربری، ایمیل یا شماره موبایل..."
              className="w-full pr-11 pl-10 py-3 text-sm bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 p-1 rounded-lg transition-colors"
                title="پاک‌کردن جستجو"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all border-2 whitespace-nowrap ${
                roleFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-950 font-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
              }`}
            >
              همه کاربران ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`px-3.5 py-1.5 rounded-xl transition-all border-2 whitespace-nowrap ${
                roleFilter === 'admin'
                  ? 'bg-teal text-white border-teal-700 font-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-teal font-bold shadow-xs'
              }`}
            >
              ادمین‌ها ({users.filter((u) => u.role === 'admin').length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('user')}
              className={`px-3.5 py-1.5 rounded-xl transition-all border-2 whitespace-nowrap ${
                roleFilter === 'user'
                  ? 'bg-slate-700 text-white border-slate-800 font-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
              }`}
            >
              کاربران عادی ({users.filter((u) => u.role !== 'admin').length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('subscribed')}
              className={`px-3.5 py-1.5 rounded-xl transition-all border-2 whitespace-nowrap ${
                roleFilter === 'subscribed'
                  ? 'bg-amber-500 text-white border-amber-600 font-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400 font-bold shadow-xs'
              }`}
            >
              دارای اشتراک فعال ({users.filter((u) => Boolean(u.active_subscription_until)).length})
            </button>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-300 shadow-sm flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-slate-400 stroke-1" />
            <h3 className="text-base font-black text-slate-800">هیچ کاربری با این مشخصات یافت نشد</h3>
            <p className="text-xs text-slate-500 max-w-sm font-medium">
              عبارت جستجو را تغییر دهید یا فیلترها را ریست کنید تا نتایج مشاهده شوند.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
              }}
              className="mt-2 px-5 py-2 rounded-2xl bg-teal text-white font-black text-xs hover:bg-teal-deep transition-colors shadow-xs"
            >
              نمایش همه کاربران
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
              >
                {/* User Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 border-2 ${
                      user.role === 'admin'
                        ? 'bg-teal/15 text-teal-900 border-teal/40'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {user.name ? user.name.slice(0, 1) : 'ک'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-black text-slate-900 text-sm">{user.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border ${
                          user.role === 'admin'
                            ? 'bg-teal/10 text-teal-900 border-teal/30'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {user.role === 'admin' && <CheckCircle2 className="w-3 h-3 text-teal-700" />}
                        <span>{user.role === 'admin' ? 'ادمین سیستم' : 'کاربر'}</span>
                      </span>

                      {user.active_subscription_until && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>اشتراک فعال</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="inline-flex items-center gap-1" dir="ltr">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{user.email}</span>
                      </span>

                      {user.phone && (
                        <a
                          href={`tel:${user.phone}`}
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-teal font-medium"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.phone}</span>
                        </a>
                      )}

                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium" dir="ltr">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(user.created_at).toLocaleDateString('fa-IR')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Actions */}
                <div className="flex items-center gap-2 justify-end sm:flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {user.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => demoteAdmin(user.id)}
                      disabled={demotingId === user.id}
                      className="px-4 py-2 rounded-xl text-xs font-black text-rose-800 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <UserMinus className="w-4 h-4 text-rose-600" />
                      <span>{demotingId === user.id ? 'در حال حذف...' : 'حذف نقش ادمین'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => promoteUser(user.id)}
                      disabled={promotingId === user.id}
                      className="px-4 py-2 rounded-xl text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 hover:border-slate-400 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-teal" />
                      <span>{promotingId === user.id ? 'در حال ارتقا...' : 'ارتقا به ادمین'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
