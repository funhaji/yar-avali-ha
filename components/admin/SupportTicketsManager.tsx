'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'

type Message = {
  id: string
  message: string
  is_admin: boolean
  created_at: string
  sender_name?: string
}

type Ticket = {
  id: string
  subject: string
  status: string
  user_name: string
  user_email: string
  created_at: string
  updated_at: string
  messages: Message[]
}

export function SupportTicketsManager() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadTickets()
  }, [])

  useEffect(() => {
    if (activeTicket) {
      scrollToBottom()
    }
  }, [activeTicket?.messages])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/support/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !activeTicket || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/admin/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          message: message.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveTicket({
          ...activeTicket,
          messages: [...activeTicket.messages, data.message]
        })
        setMessage('')
        scrollToBottom()
        // Reload tickets to update the list
        loadTickets()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('خطا در ارسال پیام')
    } finally {
      setSending(false)
    }
  }

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' })
      })

      if (response.ok) {
        loadTickets()
        if (activeTicket?.id === ticketId) {
          setActiveTicket(null)
        }
      }
    } catch (error) {
      console.error('Failed to close ticket:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock style={{ width: 16, color: 'var(--sunflower)' }} />
      case 'closed':
        return <CheckCircle style={{ width: 16, color: 'var(--teal-deep)' }} />
      default:
        return <MessageCircle style={{ width: 16 }} />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'باز'
      case 'closed':
        return 'بسته شده'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" style={{ width: 40, color: 'var(--teal-deep)' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeTicket ? '320px 1fr' : '1fr', gap: '1.5rem', minHeight: '600px' }}>
      {/* Tickets List */}
      <div className="card" style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '80vh' }}>
        <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>
          تیکت‌ها ({tickets.length})
        </h3>
        
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ink-soft)' }}>
            <MessageCircle style={{ width: 40, margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>تیکتی وجود ندارد</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className="card"
                style={{
                  padding: '1rem',
                  textAlign: 'right',
                  cursor: 'pointer',
                  background: activeTicket?.id === ticket.id ? 'var(--cream)' : 'var(--paper)',
                  border: activeTicket?.id === ticket.id ? '2px solid var(--teal)' : '1px solid var(--line-soft)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>
                      {ticket.user_name}
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'var(--ink-soft)' }}>
                      {ticket.user_email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.8rem' }}>
                    {getStatusIcon(ticket.status)}
                    <span>{getStatusLabel(ticket.status)}</span>
                  </div>
                </div>
                <div style={{ fontSize: '.9rem', color: 'var(--ink-soft)' }}>
                  {new Date(ticket.updated_at).toLocaleDateString('fa-IR')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail */}
      {activeTicket && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          <div style={{ borderBottom: '1px solid var(--line-soft)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '.75rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '.25rem' }}>
                  {activeTicket.user_name}
                </h3>
                <p style={{ fontSize: '.9rem', color: 'var(--ink-soft)' }}>
                  {activeTicket.user_email}
                </p>
              </div>
              {activeTicket.status === 'open' && (
                <button
                  onClick={() => handleCloseTicket(activeTicket.id)}
                  className="button button-ghost"
                  style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}
                >
                  <XCircle style={{ width: 16 }} />
                  بستن تیکت
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', color: 'var(--ink-soft)' }}>
              {getStatusIcon(activeTicket.status)}
              <span>{getStatusLabel(activeTicket.status)}</span>
              <span>•</span>
              <span>{new Date(activeTicket.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.is_admin ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '.875rem 1.125rem',
                      borderRadius: '16px',
                      fontSize: '.95rem',
                      lineHeight: 1.6,
                      background: msg.is_admin ? 'var(--teal)' : 'var(--cream)',
                      color: msg.is_admin ? 'var(--paper)' : 'var(--ink)',
                      borderBottomLeftRadius: msg.is_admin ? '4px' : '16px',
                      borderBottomRightRadius: msg.is_admin ? '16px' : '4px'
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '.75rem',
                        marginTop: '.375rem',
                        opacity: 0.7
                      }}
                    >
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
          </div>

          {/* Input */}
          {activeTicket.status === 'open' && (
            <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '1rem' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                rows={3}
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
                  fontFamily: 'inherit',
                  marginBottom: '.75rem'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="button button-primary"
              >
                {sending ? (
                  <Loader2 className="animate-spin" style={{ width: 18 }} />
                ) : (
                  <>
                    <Send style={{ width: 18 }} />
                    ارسال پاسخ
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
