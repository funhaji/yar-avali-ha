'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function HeroCta({ defaultText }: { defaultText?: string | null }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof document !== 'undefined' && document.cookie.includes('session_token')) {
      setIsLoggedIn(true)
    }
  }, [])

  const ctaText = defaultText || (isLoggedIn ? 'رفتن به داشبورد' : 'رایگان شروع کن')
  const href = isLoggedIn ? '/dashboard' : '/register'

  return (
    <Link href={href} className="button button-primary button-lg">
      {ctaText} <ArrowLeft />
    </Link>
  )
}
