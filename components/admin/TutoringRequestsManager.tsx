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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border-2 border-blue-300 shadow-xs"><CheckCircle2 className="w-3.5 h-3.5 text-blue-700" /> تایید شده</span>
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border-2 border-emerald-300 shadow-xs"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> انجام شده</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border-2 border-rose-300 shadow-xs"><XCircle className="w-3.5 h-3.5 text-rose-700" /> لغو شده</span>
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border-2 border-amber-300 shadow-xs"><Clock className="w-3.5 h-3.5 text-amber-700" /> در انتظار بررسی</span>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top filters */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-300 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-950 font-black shadow-xs'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 font-bold shadow-xs'
            }`}
          >
            همه ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white border-amber-600 font-black shadow-xs'
                : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400 font-bold shadow-xs'
            }`}
          >
            در انتظار بررسی
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 whitespace-nowrap ${
              statusFilter === 'confirmed'
                ? 'bg-blue-600 text-white border-blue-700 font-black shadow-xs'
                : 'bg-white text-slate-800 border-slate-300 hover:border-blue-400 font-bold shadow-xs'
            }`}
          >
            تایید شده
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white border-emerald-700 font-black shadow-xs'
                : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-400 font-bold shadow-xs'
            }`}
          >
            انجام شده
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white border-rose-700 font-black shadow-xs'
                : 'bg-white text-slate-800 border-slate-300 hover:border-rose-400 font-bold shadow-xs'
            }`}
          >
            لغو شده
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شماره، استاد..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium text-xs">در حال بارگذاری درخواست‌ها...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-300 shadow-md text-slate-500 flex flex-col items-center gap-3">
          <BookOpen className="w-12 h-12 text-slate-400 stroke-1" />
          <p className="text-sm font-black text-slate-800">درخواستی یافت نشد</p>
          <p className="text-xs text-slate-500 font-medium">درخواست‌های ثبت‌شده توسط دانش‌آموزان و اولیا در این بخش نمایش داده می‌شوند.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b-2 border-slate-200 pb-3.5 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal/15 border-2 border-teal/40 text-teal-800 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{r.student_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-teal-800 font-black hover:underline"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal" />
                          <span>{r.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(r.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200">
                    <span className="text-slate-500 font-bold">استاد:</span>
                    <span className="font-black text-slate-900 truncate">{r.teacher_name || 'نامشخص'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200">
                    <span className="text-slate-500 font-bold">شیوه:</span>
                    <span className="font-black text-slate-900">
                      {r.teaching_mode === 'in_person' ? 'حضوری' : 'آنلاین'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200">
                    <span className="text-slate-500 font-bold">پایه:</span>
                    <span className="font-black text-slate-900 truncate">{r.grade || 'مشخص‌نشده'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200">
                    <span className="text-slate-500 font-bold">درس:</span>
                    <span className="font-black text-slate-900 truncate">{r.subject || 'مشخص‌نشده'}</span>
                  </div>
                </div>

                {(r.duration_minutes || r.preferred_time || r.city) && (
                  <div className="flex flex-wrap gap-2 text-xs text-slate-700 mb-3">
                    {r.duration_minutes && (
                      <span className="px-2.5 py-1 rounded-lg bg-teal/10 text-teal-900 border border-teal/30 font-black">
                        {r.duration_minutes} دقیقه
                      </span>
                    )}
                    {r.preferred_time && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{r.preferred_time}</span>
                      </span>
                    )}
                    {r.city && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{r.city}</span>
                      </span>
                    )}
                  </div>
                )}

                {r.notes && (
                  <div className="text-xs bg-slate-50 p-3 rounded-xl border-2 border-slate-200 text-slate-800 mb-2">
                    <span className="font-black text-slate-700 block mb-1">توضیحات دانش‌آموز:</span>
                    <p className="leading-relaxed font-medium">{r.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3.5 border-t-2 border-slate-200">
                <span className="text-xs text-slate-500 font-bold" dir="ltr">
                  {new Date(r.created_at).toLocaleDateString('fa-IR')}
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={r.status}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    disabled={updatingId === r.id}
                    className="text-xs bg-white border-2 border-slate-300 rounded-xl px-3 py-1.5 font-black text-slate-900 focus:outline-none focus:border-teal shadow-xs"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="confirmed">تایید شده</option>
                    <option value="completed">انجام شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>

                  <button
                    onClick={() => deleteRequest(r.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-300 rounded-xl transition-all shadow-xs"
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
