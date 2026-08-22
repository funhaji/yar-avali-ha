'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Phone, Mail, Loader2 } from 'lucide-react'

type Message = {
  id: string
  message: string
  is_admin: boolean
  created_at: string
}

type Ticket = {
  id: string
  reason: string
  subject: string
  description: string
  status: string
  messages: Message[]
}

export function SupportBubble({ 
  isLoggedIn, 
  contactPhone, 
  contactEmail,
  socialInstagram,
  socialTelegram,
  socialWhatsapp
}: { 
  isLoggedIn: boolean
  contactPhone?: string
  contactEmail?: string
  socialInstagram?: string
  socialTelegram?: string
  socialWhatsapp?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  
  // New ticket form fields
  const [newTicketReason, setNewTicketReason] = useState('')
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketDescription, setNewTicketDescription] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (showChat && activeTicket) {
      scrollToBottom()
    }
  }, [activeTicket?.messages, showChat])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/support/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
        if (data.tickets && data.tickets.length > 0) {
          setActiveTicket(data.tickets[0])
        }
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChat = async () => {
    if (!isLoggedIn) {
      alert('برای استفاده از چت پشتیبانی ابتدا وارد شوید')
      window.location.href = '/login'
      return
    }
    setShowOptions(false)
    setShowChat(true)
    await loadTickets()
  }
  
  const handleCreateNewTicket = () => {
    setShowChat(false)
    setShowNewTicketForm(true)
    setShowOptions(false)
  }
  
  const handleSubmitNewTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketReason || !newTicketSubject || !newTicketDescription) {
      alert('لطفاً تمام فیلدها را پر کنید')
      return
    }
    
    setSending(true)
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: newTicketReason,
          subject: newTicketSubject,
          description: newTicketDescription
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setActiveTicket(data.ticket)
        setTickets([data.ticket, ...tickets])
        setNewTicketReason('')
        setNewTicketSubject('')
        setNewTicketDescription('')
        setShowNewTicketForm(false)
        setShowChat(true)
      } else {
        alert('خطا در ایجاد تیکت')
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
      alert('خطا در ایجاد تیکت')
    } finally {
      setSending(false)
    }
  }
  
  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm('آیا می‌خواهید این تیکت را ببندید؟')) return
    
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: 'closed' })
      })
      
      if (response.ok) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t))
        if (activeTicket?.id === ticketId) {
          setActiveTicket({ ...activeTicket, status: 'closed' })
        }
        alert('تیکت با موفقیت بسته شد')
      }
    } catch (error) {
      console.error('Failed to close ticket:', error)
      alert('خطا در بستن تیکت')
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket?.id,
          message: message.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (activeTicket) {
          setActiveTicket({
            ...activeTicket,
            messages: [...activeTicket.messages, data.message]
          })
        }
        setMessage('')
        scrollToBottom()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('خطا در ارسال پیام')
    } finally {
      setSending(false)
    }
  }

  const handleBack = () => {
    if (showNewTicketForm) {
      setShowNewTicketForm(false)
      setShowOptions(true)
      return
    }
    setShowChat(false)
    setShowOptions(true)
    setActiveTicket(null)
  }

  return (
    <>
      {/* Support Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="support-bubble"
          aria-label="پشتیبانی"
        >
          <MessageCircle />
        </button>
      )}

      {/* Support Panel */}
      {isOpen && (
        <div className="support-panel">
          {/* Header */}
          <div className="support-header">
            <div className="flex items-center gap-2">
              <MessageCircle style={{ width: 20 }} />
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>پشتیبانی</h3>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false)
                setShowOptions(true)
                setShowChat(false)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
              aria-label="بستن"
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          {/* Content */}
          <div className="support-content">
            {showOptions && (
              <div className="support-options">
                <p style={{ marginBottom: '1.5rem', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
                  چطور می‌تونیم کمکتون کنیم؟
                </p>

                <button
                  onClick={handleOpenChat}
                  className="support-option-btn"
                >
                  <MessageCircle style={{ width: 24, color: 'var(--teal-deep)' }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>چت با پشتیبانی</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--ink-soft)' }}>
                      {isLoggedIn ? 'مشاهده تیکت‌ها و پیام‌ها' : 'ابتدا وارد شوید'}
                    </div>
                  </div>
                </button>

                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="support-option-btn"
                  >
                    <Phone style={{ width: 24, color: 'var(--berry)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>تماس تلفنی</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--ink-soft)', direction: 'ltr', textAlign: 'right' }}>
                        {contactPhone}
                      </div>
                    </div>
                  </a>
                )}

                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="support-option-btn"
                  >
                    <Mail style={{ width: 24, color: 'var(--sunflower)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>ارسال ایمیل</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--ink-soft)', direction: 'ltr', textAlign: 'right' }}>
                        {contactEmail}
                      </div>
                    </div>
                  </a>
                )}

                {/* Social Media Links - Only show if set */}
                {(socialInstagram || socialTelegram || socialWhatsapp) && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--line-soft)' }}>
                    <p style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: '.75rem', color: 'var(--ink-soft)' }}>
                      شبکه‌های اجتماعی
                    </p>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                      {socialInstagram && (
                        <a
                          href={socialInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            color: 'white',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          title="اینستاگرام"
                        >
                          <svg style={{ width: 24, height: 24 }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {socialTelegram && (
                        <a
                          href={socialTelegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#0088cc',
                            color: 'white',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          title="تلگرام"
                        >
                          <svg style={{ width: 24, height: 24 }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </a>
                      )}
                      {socialWhatsapp && (
                        <a
                          href={`https://wa.me/${socialWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#25D366',
                            color: 'white',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          title="واتس‌اپ"
                        >
                          <svg style={{ width: 24, height: 24 }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showNewTicketForm && (
              <div className="support-chat">
                <button
                  onClick={handleBack}
                  style={{ 
                    marginBottom: '1rem', 
                    color: 'var(--teal-deep)', 
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ← بازگشت
                </button>
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>تیکت جدید</h3>
                
                <form onSubmit={handleSubmitNewTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 600, marginBottom: '.5rem' }}>
                      دلیل تماس *
                    </label>
                    <select
                      value={newTicketReason}
                      onChange={(e) => setNewTicketReason(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '.75rem',
                        border: '1px solid var(--line)',
                        borderRadius: '.5rem',
                        fontSize: '.95rem',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="technical">مشکل فنی</option>
                      <option value="subscription">اشتراک و پرداخت</option>
                      <option value="content">محتوا و آموزش</option>
                      <option value="account">حساب کاربری</option>
                      <option value="suggestion">پیشنهاد</option>
                      <option value="other">سایر</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 600, marginBottom: '.5rem' }}>
                      عنوان تیکت *
                    </label>
                    <input
                      type="text"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="خلاصه‌ای از مشکل یا سوالتان"
                      required
                      maxLength={200}
                      style={{
                        width: '100%',
                        padding: '.75rem',
                        border: '1px solid var(--line)',
                        borderRadius: '.5rem',
                        fontSize: '.95rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 600, marginBottom: '.5rem' }}>
                      توضیحات *
                    </label>
                    <textarea
                      value={newTicketDescription}
                      onChange={(e) => setNewTicketDescription(e.target.value)}
                      placeholder="لطفاً مشکل یا سوال خود را با جزئیات بیشتر توضیح دهید"
                      required
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '.75rem',
                        border: '1px solid var(--line)',
                        borderRadius: '.5rem',
                        fontSize: '.95rem',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={sending}
                    className="button button-primary"
                    style={{ width: '100%' }}
                  >
                    {sending ? (
                      <Loader2 className="animate-spin" style={{ width: 18 }} />
                    ) : (
                      <>
                        <Send style={{ width: 18 }} />
                        ارسال تیکت
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {showChat && (
              <div className="support-chat">
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Loader2 className="animate-spin" style={{ width: 32, color: 'var(--teal-deep)' }} />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleBack}
                      style={{ 
                        marginBottom: '1rem', 
                        color: 'var(--teal-deep)', 
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ← بازگشت
                    </button>

                    {/* Tickets list or active ticket */}
                    {!activeTicket ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>تیکت‌های من</h3>
                          <button
                            onClick={handleCreateNewTicket}
                            className="button button-primary"
                            style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}
                          >
                            تیکت جدید +
                          </button>
                        </div>
                        
                        {tickets.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--ink-soft)' }}>
                            <MessageCircle style={{ width: 40, margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p>شما هیچ تیکتی ندارید</p>
                            <button
                              onClick={handleCreateNewTicket}
                              className="button button-primary"
                              style={{ marginTop: '1rem' }}
                            >
                              ایجاد تیکت جدید
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                            {tickets.map((ticket) => (
                              <div
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                style={{
                                  padding: '1rem',
                                  border: '1px solid var(--line)',
                                  borderRadius: '.5rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--teal-deep)'
                                  e.currentTarget.style.backgroundColor = 'var(--cloud)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--line)'
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                  <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{ticket.subject}</span>
                                  <span 
                                    style={{ 
                                      fontSize: '.75rem', 
                                      padding: '.25rem .5rem', 
                                      borderRadius: '.25rem',
                                      backgroundColor: ticket.status === 'open' ? 'var(--teal-soft)' : 'var(--ink-soft)',
                                      color: ticket.status === 'open' ? 'var(--teal-deep)' : 'white'
                                    }}
                                  >
                                    {ticket.status === 'open' ? 'باز' : 'بسته'}
                                  </span>
                                </div>
                                <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginBottom: '.5rem' }}>
                                  {ticket.description.slice(0, 80)}{ticket.description.length > 80 ? '...' : ''}
                                </p>
                                <div style={{ fontSize: '.75rem', color: 'var(--ink-soft)' }}>
                                  {ticket.messages?.length || 0} پیام
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Active ticket header */}
                        <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{activeTicket.subject}</h3>
                            {activeTicket.status === 'open' && (
                              <button
                                onClick={() => handleCloseTicket(activeTicket.id)}
                                style={{
                                  fontSize: '.75rem',
                                  padding: '.25rem .75rem',
                                  background: 'var(--berry-soft)',
                                  color: 'var(--berry)',
                                  border: 'none',
                                  borderRadius: '.25rem',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                بستن تیکت
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)' }}>{activeTicket.description}</p>
                          <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                            <span 
                              style={{ 
                                fontSize: '.75rem', 
                                padding: '.25rem .5rem', 
                                borderRadius: '.25rem',
                                backgroundColor: 'var(--cloud)',
                                color: 'var(--ink-soft)'
                              }}
                            >
                              {activeTicket.reason === 'technical' ? 'مشکل فنی' : 
                               activeTicket.reason === 'subscription' ? 'اشتراک و پرداخت' :
                               activeTicket.reason === 'content' ? 'محتوا و آموزش' :
                               activeTicket.reason === 'account' ? 'حساب کاربری' :
                               activeTicket.reason === 'suggestion' ? 'پیشنهاد' : 'سایر'}
                            </span>
                            <button
                              onClick={() => setActiveTicket(null)}
                              style={{
                                fontSize: '.75rem',
                                color: 'var(--teal-deep)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              بازگشت به لیست
                            </button>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="support-messages">
                          {!activeTicket?.messages?.length && (
                            <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '2rem 1rem' }}>
                              <MessageCircle style={{ width: 40, margin: '0 auto 1rem', opacity: 0.3 }} />
                              <p>پیام خود را بنویسید و ما در اسرع وقت پاسخ می‌دهیم</p>
                            </div>
                          )}
                          {activeTicket?.messages?.map((msg) => (
                            <div
                              key={msg.id}
                              className={`support-message ${msg.is_admin ? 'admin' : 'user'}`}
                            >
                              <div className="support-message-bubble">
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                <span className="support-message-time">
                                  {new Date(msg.created_at).toLocaleTimeString('fa-IR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input - only show if ticket is open */}
                        {activeTicket.status === 'open' && (
                          <div className="support-input">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="پیام خود را بنویسید..."
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                              disabled={sending}
                              style={{ 
                                width: '100%', 
                                border: '1px solid var(--line)', 
                                borderRadius: '.5rem', 
                                padding: '.75rem',
                                fontSize: '.95rem',
                                resize: 'none',
                                fontFamily: 'inherit'
                              }}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!message.trim() || sending}
                              className="button button-primary"
                              style={{ marginTop: '.5rem', width: '100%' }}
                            >
                              {sending ? (
                                <Loader2 className="animate-spin" style={{ width: 18 }} />
                              ) : (
                                <>
                                  <Send style={{ width: 18 }} />
                                  ارسال
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {activeTicket.status === 'closed' && (
                          <div style={{ 
                            padding: '1rem', 
                            background: 'var(--cloud)', 
                            borderRadius: '.5rem', 
                            textAlign: 'center',
                            color: 'var(--ink-soft)',
                            fontSize: '.9rem'
                          }}>
                            این تیکت بسته شده است. برای ارسال پیام جدید، تیکت جدیدی ایجاد کنید.
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
