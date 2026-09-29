'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, XCircle, Trash2, Phone, Calendar, User, BookOpen, MapPin, Search } from 'lucide-react'

interface TutoringRequest {
  id: string
  teacher_id: string
  teacher_name?: string
  teacher_photo?: string | null
  user_id?: string | null
  student_name: string
  phone: string
  teaching_mode: string
  grade?: string | null
  subject?: string | null
  duration_minutes?: number | null
  preferred_time?: string | null
  city?: string | null
  notes?: string | null
  status: string
  created_at: string
}

export function TutoringRequestsManager() {
  const [requests, setRequests] = useState<TutoringRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  async function loadRequests() {
    setLoading(true)
    try {
      const url = statusFilter === 'all'
        ? '/api/admin/tutoring/requests'
        : `/api/admin/tutoring/requests?status=${statusFilter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/tutoring/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm('آیا از حذف این درخواست تدریس اطمینان دارید؟')) return
    try {
      const res = await fetch('/api/admin/tutoring/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredRequests = requests.filter(r => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      r.student_name?.toLowerCase().includes(term) ||
      r.phone?.includes(term) ||
      r.teacher_name?.toLowerCase().includes(term) ||
      r.subject?.toLowerCase().includes(term) ||
      r.grade?.toLowerCase().includes(term)
    )
  })

  function getStatusBadge(status: string) {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3.5 h-3.5" /> تایید شده</span>
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> انجام شده</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> لغو شده</span>
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> در انتظار بررسی</span>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            در انتظار بررسی
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            تایید شده
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            انجام شده
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'cancelled' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            لغو شده
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شماره، استاد..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">در حال بارگذاری درخواست‌ها...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm text-slate-400 flex flex-col items-center gap-3">
          <BookOpen className="w-12 h-12 text-slate-300 stroke-1" />
          <p className="text-sm font-bold text-slate-600">درخواستی یافت نشد</p>
          <p className="text-xs text-slate-400">درخواست‌های ثبت‌شده توسط دانش‌آموزان و اولیا در این بخش نمایش داده می‌شوند.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{r.student_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-teal font-bold hover:underline"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{r.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(r.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400">استاد:</span>
                    <span className="font-bold text-slate-800">{r.teacher_name || 'نامشخص'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400">شیوه:</span>
                    <span className="font-bold text-slate-800">
                      {r.teaching_mode === 'in_person' ? 'حضوری' : 'آنلاین'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400">پایه:</span>
                    <span className="font-bold text-slate-800">{r.grade || 'مشخص‌نشده'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400">درس:</span>
                    <span className="font-bold text-slate-800">{r.subject || 'مشخص‌نشده'}</span>
                  </div>
                </div>

                {(r.duration_minutes || r.preferred_time || r.city) && (
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                    {r.duration_minutes && (
                      <span className="px-2 py-0.5 rounded-lg bg-teal/5 text-teal border border-teal/15 font-bold">
                        {r.duration_minutes} دقیقه
                      </span>
                    )}
                    {r.preferred_time && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{r.preferred_time}</span>
                      </span>
                    )}
                    {r.city && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{r.city}</span>
                      </span>
                    )}
                  </div>
                )}

                {r.notes && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700 mb-2">
                    <span className="font-bold text-slate-500 block mb-1">توضیحات دانش‌آموز:</span>
                    <p className="leading-relaxed">{r.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400" dir="ltr">
                  {new Date(r.created_at).toLocaleDateString('fa-IR')}
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={r.status}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    disabled={updatingId === r.id}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none focus:border-teal"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="confirmed">تایید شده</option>
                    <option value="completed">انجام شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>

                  <button
                    onClick={() => deleteRequest(r.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="حذف درخواست"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
