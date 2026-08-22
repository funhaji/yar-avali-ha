'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function ClientSiteBrand() {
  const [siteName, setSiteName] = useState('یارِ اولی‌ها')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.site_name) setSiteName(data.settings.site_name)
        if (data.settings?.site_logo_url) setSiteLogo(data.settings.site_logo_url)
      })
      .catch(() => {
        // Keep default on error
      })
  }, [])

  return (
    <Link href="/" className="brand" style={{marginBottom:'1.5rem'}}>
      {siteLogo ? (
        <img src={siteLogo} alt={siteName} style={{ maxHeight: '40px', objectFit: 'contain' }} />
      ) : (
        <>
          <span className="brand-mark">۱</span>
          <span>{siteName}</span>
        </>
      )}
    </Link>
  )
}

export function ClientSubscriptionHeader() {
  const [siteName, setSiteName] = useState('یار اولی‌ها')

  useEffect(() => {
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.site_name) setSiteName(data.settings.site_name)
      })
      .catch(() => {
        // Keep default on error
      })
  }, [])

  return (
    <>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        اشتراک {siteName}
      </h1>
    </>
  )
}

export function ClientSubscriptionHeaderLink() {
  const [siteName, setSiteName] = useState('یار اولی‌ها')

  useEffect(() => {
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.site_name) setSiteName(data.settings.site_name)
      })
      .catch(() => {
        // Keep default on error
      })
  }, [])

  return (
    <Link href="/" className="text-2xl font-bold text-purple-600">
      {siteName}
    </Link>
  )
}
