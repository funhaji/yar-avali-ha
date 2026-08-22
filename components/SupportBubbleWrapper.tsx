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
  isLoggedIn: boolean
  contactPhone?: string
  contactEmail?: string
  socialInstagram?: string
  socialTelegram?: string
  socialWhatsapp?: string
}) {
  const pathname = usePathname()
  
  // Don't show on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <SupportBubble
      isLoggedIn={isLoggedIn}
      contactPhone={contactPhone}
      contactEmail={contactEmail}
      socialInstagram={socialInstagram}
      socialTelegram={socialTelegram}
      socialWhatsapp={socialWhatsapp}
    />
  )
}
