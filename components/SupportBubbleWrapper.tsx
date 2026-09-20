'use client'

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
  
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const effectiveIsLoggedIn = isLoggedIn ?? (typeof document !== 'undefined' && document.cookie.includes('session_token'))

  return (
    <SupportBubble
      isLoggedIn={effectiveIsLoggedIn}
      contactPhone={contactPhone}
      contactEmail={contactEmail}
      socialInstagram={socialInstagram}
      socialTelegram={socialTelegram}
      socialWhatsapp={socialWhatsapp}
    />
  )
}
