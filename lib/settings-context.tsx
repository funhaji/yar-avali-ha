'use client'

import { createContext, useContext, ReactNode } from 'react'

type SettingsContextType = {
  siteName: string
  siteLogo: string
  navLinks: { title: string, url: string, icon: string }[]
}

const SettingsContext = createContext<SettingsContextType>({
  siteName: 'یار اولی ها',
  siteLogo: '',
  navLinks: []
})

export function SettingsProvider({ 
  children, 
  settings 
}: { 
  children: ReactNode, 
  settings: { site_name?: string | null, site_logo_url?: string | null, [key: string]: any } 
}) {
  
  const navLinks = [];
  for (let i = 1; i <= 7; i++) {
    const title = settings[`nav_${i}_title`];
    const url = settings[`nav_${i}_url`];
    const icon = settings[`nav_${i}_icon`];
    if (title && url) {
      navLinks.push({ title, url, icon: icon || '' });
    }
  }

  // Fallback to default if empty
  if (navLinks.length === 0) {
    navLinks.push(
      { title: 'فروشگاه', url: '/shop', icon: 'ShoppingBag' },
      { title: 'سرگرمی', url: '/entertainment', icon: 'Clapperboard' },
      { title: 'کاربرگ‌ها', url: '/worksheets', icon: '' },
      { title: 'وبلاگ', url: '/blog', icon: '' },
      { title: 'کتاب‌ها', url: '/books', icon: 'BookOpen' },
      { title: 'گالری', url: '/gallery', icon: '' },
      { title: 'درباره ما', url: '/about', icon: '' }
    );
  }

  const value = {
    siteName: settings.site_name || 'یار اولی ها',
    siteLogo: settings.site_logo_url || '',
    navLinks
  }


  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
