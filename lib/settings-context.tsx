'use client'

import { createContext, useContext, ReactNode } from 'react'

type SettingsContextType = {
  siteName: string
  siteLogo: string
}

const SettingsContext = createContext<SettingsContextType>({
  siteName: 'یار اولی ها',
  siteLogo: ''
})

export function SettingsProvider({ 
  children, 
  settings 
}: { 
  children: ReactNode, 
  settings: { site_name?: string | null, site_logo_url?: string | null } 
}) {
  const value = {
    siteName: settings.site_name || 'یار اولی ها',
    siteLogo: settings.site_logo_url || ''
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
