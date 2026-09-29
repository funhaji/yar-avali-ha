'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SupportBubble } from './SupportBubble'

export function SupportBubbleWrapper({
  isLoggedIn,
  contactPhone,
  contactEmail,
  socialInstagram,
  socialTelegram,
  socialWhatsapp
}: {
  isLoggedIn?: boolean
  contactPhone?: string
  contactEmail?: string
  socialInstagram?: string
  socialTelegram?: string
  socialWhatsapp?: string
}) {
  const pathname = usePathname()
  const [clientLoggedIn, setClientLoggedIn] = useState(
    isLoggedIn ?? (typeof document !== 'undefined' && document.cookie.includes('is_logged_in'))
  )
  
  useEffect(() => {
    if (isLoggedIn !== undefined) {
      setClientLoggedIn(isLoggedIn)
      return
    }
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d?.user) setClientLoggedIn(true)
        else setClientLoggedIn(false)
      })
      .catch(() => {})
  }, [isLoggedIn])

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <SupportBubble
      isLoggedIn={clientLoggedIn}
      contactPhone={contactPhone}
      contactEmail={contactEmail}
      socialInstagram={socialInstagram}
      socialTelegram={socialTelegram}
      socialWhatsapp={socialWhatsapp}
    />
  )
}
