'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, PlusCircle, CheckCircle2, Clock, 
  Send, AlertCircle, Loader2, ChevronDown, ChevronUp, User, Shield
} from 'lucide-react'

interface SupportMessage {
  id: string
  message: string
  is_admin: boolean
  created_at: string
}

interface SupportTicket {
  id: string
  reason?: string
  subject: string
  description?: string
  status: string
  created_at: string
  updated_at: string
  messages: SupportMessage[]
}

export function UserSupportTicketsSection() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replying, setReplying] = useState(false)
  
  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newReason, setNewReason] = useState('technical')
  const [newDescription, setNewDescription] = useState('')
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [ticketError, setTicketError] = useState('')
  const [successToast, setSuccessToast] = useState<string | null>(null)

  function loadTickets() {
    setLoading(true)
    fetch('/api/support/tickets')
      .then(res => res.json())
      .then(d => {
        if (d.tickets) setTickets(d.tickets)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadTickets()
  }, [])

  function showToast(msg: string) {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  async function handleSendReply(ticketId: string) {
    if (!replyMessage.trim()) return
    setReplying(true)
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, message: replyMessage.trim() })
      })
      if (res.ok) {
        setReplyMessage('')
        showToast('پاسخ شما با موفقیت ارسال شد.')
        loadTickets()
      } else {
        const d = await res.json()
        alert(d.error || 'خطا در ارسال پاسخ')
      }
    } catch {
      alert('خطا در ارتباط با سرور')
    } finally {
      setReplying(false)
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault()
    setTicketError('')
    if (!newSubject.trim()) {
      setTicketError('عنوان تیکت الزامی است')
      return
    }
    if (!newDescription.trim()) {
      setTicketError('شرح پیام الزامی است')
      return
    }

    setSubmittingTicket(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject.trim(),
          reason: newReason,
          description: newDescription.trim()
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setTicketError(data.error || 'خطا در ثبت تیکت')
        setSubmittingTicket(false)
        return
      }

      showToast('تیکت شما با موفقیت ثبت شد. به زودی پاسخ داده خواهد شد.')
      setNewSubject('')
      setNewDescription('')
      setIsModalOpen(false)
      loadTickets()
    } catch (err: any) {
      setTicketError(err.message || 'خطا در ارتباط با سرور')
    } finally {
      setSubmittingTicket(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'closed':
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border-2 border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            بسته شده
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-950 border-2 border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            در حال پیگیری
          </span>
        )
      case 'open':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-950 border-2 border-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            در انتظار بررسی
          </span>
        )
    }
  }

  const reasonLabels: Record<string, string> = {
    financial: 'مالی و پرداخت',
    technical: 'فنی و دانلود فایل',
    tutoring: 'کلاس‌های تدریس و اساتید',
    content: 'دسترسی به ویدیوها و کتاب‌ها',
    other: 'سایر موارد'
  }

  return (
    <div className="flex flex-col gap-4">
      {successToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 text-xs font-black flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal" />
            <span>تیکت‌ها و پیام‌های پشتیبانی ({tickets.length})</span>
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            در صورت بروز هرگونه سوال یا مشکل با کارشناسان ما گفتگو کنید
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white font-black text-xs hover:bg-teal-deep border-2 border-teal-800 shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ارسال تیکت جدید</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-teal" />
          <span>در حال دریافت تیکت‌ها...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card p-8 rounded-3xl border-2 border-slate-300 bg-white text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-teal/10 border-2 border-teal/20 text-teal flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-900">هنوز تیکت پشتیبانی ارسال نکرده‌اید</h4>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md font-medium leading-relaxed">
            در صورت بروز مشکل در خرید، دانلود فایل، هماهنگی کلاس‌ها یا اشتراک، می‌توانید پیام خود را ثبت نمایید.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white font-black text-xs hover:bg-teal-deep border-2 border-teal-800 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت اولین تیکت پشتیبانی</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => {
            const isExpanded = expandedTicketId === t.id
            const allMessages = t.messages || []

            return (
              <div
                key={t.id}
                className="rounded-2xl bg-white border-2 border-slate-300 overflow-hidden shadow-xs hover:border-slate-400 transition-all"
              >
                <div
                  onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 text-teal flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm sm:text-base text-slate-900">{t.subject}</span>
                        {t.reason && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                            {reasonLabels[t.reason] || t.reason}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold mt-0.5 flex items-center gap-2">
                        <span>تاریخ: {new Date(t.created_at).toLocaleDateString('fa-IR')}</span>
                        <span>•</span>
                        <span>{allMessages.length} پیام</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    {getStatusBadge(t.status)}
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t-2 border-slate-200 bg-white flex flex-col gap-4">
                    {t.description && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 leading-relaxed">
                        <span className="font-black text-slate-900 block mb-1">شرح اولیه تیکت:</span>
                        {t.description}
                      </div>
                    )}

                    {/* Messages list */}
                    <div className="space-y-3">
                      {allMessages.map(m => (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl border-2 flex flex-col gap-1.5 max-w-[85%] ${
                            m.is_admin
                              ? 'bg-purple-50/60 border-purple-200 mr-auto text-purple-950'
                              : 'bg-teal/5 border-teal/30 ml-auto text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-black">
                            {m.is_admin ? (
                              <span className="flex items-center gap-1 text-purple-800">
                                <Shield className="w-3.5 h-3.5" />
                                <span>پشتیبانی یار اولی‌ها</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-teal-800">
                                <User className="w-3.5 h-3.5" />
                                <span>شما</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-normal mr-auto">
                              {new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} - {new Date(m.created_at).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-justify">
                            {m.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Reply form */}
                    {t.status !== 'closed' && (
                      <div className="mt-2 pt-4 border-t-2 border-slate-100 flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-800">ارسال پاسخ جدید:</label>
                        <div className="flex gap-2">
                          <textarea
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            placeholder="متن پاسخ خود را اینجا بنویسید..."
                            rows={2}
                            className="flex-1 px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs resize-none"
                          />
                          <button
                            type="button"
                            disabled={replying || !replyMessage.trim()}
                            onClick={() => handleSendReply(t.id)}
                            className="px-5 rounded-xl bg-teal hover:bg-teal-deep text-white font-black text-xs border-2 border-teal-700 shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>ارسال</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b-2 border-slate-800">
              <h3 className="text-base font-black flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal" />
                <span>ارسال تیکت پشتیبانی جدید</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4">
              {ticketError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{ticketError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">موضوع تیکت *</label>
                <input
                  type="text"
                  placeholder="مثال: سوال درباره دانلود کاربرگ یا هماهنگی کلاس"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">دپارتمان / بخش مرتبط *</label>
                <select
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal shadow-xs"
                >
                  <option value="technical">فنی و دانلود فایل</option>
                  <option value="financial">مالی، خرید و پرداخت</option>
                  <option value="tutoring">کلاس‌ها، دوره‌ها و معلمان</option>
                  <option value="content">محتواها و ویدیوها</option>
                  <option value="other">سایر موارد عمومی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">متن پیام و توضیحات *</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="شرح دقیق مشکل یا درخواست خود را بنویسید..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal shadow-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal text-white font-black text-xs hover:bg-teal-deep border-2 border-teal-800 shadow-xs disabled:opacity-50"
                >
                  {submittingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>ثبت و ارسال تیکت</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
