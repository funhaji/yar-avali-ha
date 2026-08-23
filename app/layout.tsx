import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { CartProvider } from '@/lib/store-context'
import { SettingsProvider } from '@/lib/settings-context'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { SupportBubbleWrapper } from '@/components/SupportBubbleWrapper'
import { getSettings } from '@/lib/settings'

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-vazir', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const settings: Record<string, string | null> = await getSettings(['site_name', 'site_logo_url']).catch(() => ({}))
  const siteName = (settings?.site_name as string) || 'یار اولی ها'
  const logoUrl = (settings?.site_logo_url as string) || '/favicon.ico'
  
  return {
    title: { default: `${siteName} | یادگیری با طعم بازی`, template: `%s | ${siteName}` },
    description: 'یار اولی ها اولین پلتفرم آموزشی پایه اول دبستان در ایران است که با روش‌های نوین و بازی‌محور یادگیری را برای دانش‌آموزان شیرین می‌کند.',
    keywords: ['یار اولی ها', 'پایه اول', 'آموزش ابتدایی', 'یادگیری با بازی'],
    icons: {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    }
  }
}

export const viewport: Viewport = { themeColor: '#fbf3e4', width: 'device-width', initialScale: 1, maximumScale: 5 }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Get user session
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  
  // Get settings
  const allSettings: Record<string, string | null> = await getSettings([
    'contact_phone', 
    'contact_email', 
    'site_font',
    'social_instagram',
    'social_telegram',
    'social_whatsapp',
    'social_eitaa',
    'site_name',
    'site_logo_url'
  ]).catch(() => ({}))
  const siteFont = (allSettings?.site_font as string) || 'vazirmatn'
  
  // Map font names to CSS classes or inline styles
  const fontClassMap: Record<string, string> = {
    'vazirmatn': vazirmatn.variable,
    'iranyekan': vazirmatn.variable, // Fallback to vazirmatn for now
    'estedad': vazirmatn.variable,
    'samim': vazirmatn.variable,
    'shabnam': vazirmatn.variable,
    'mikhak': vazirmatn.variable,
  }
  
  const fontClass = fontClassMap[siteFont] || vazirmatn.variable
  
  return (
    <html lang="fa" dir="rtl" className="bg-background">
      <body className={`${fontClass} font-sans`} style={{ fontFamily: siteFont === 'vazirmatn' ? undefined : `'${siteFont}', var(--font-vazir), 'Tahoma', sans-serif` }}>
        <SettingsProvider settings={{ site_name: allSettings.site_name, site_logo_url: allSettings.site_logo_url }}>
          <CartProvider>
            {children}
            <CartDrawer />
            <SupportBubbleWrapper
              isLoggedIn={!!user}
              contactPhone={(allSettings?.contact_phone as string) || undefined}
              contactEmail={(allSettings?.contact_email as string) || undefined}
              socialInstagram={(allSettings?.social_instagram as string) || undefined}
              socialTelegram={(allSettings?.social_telegram as string) || undefined}
              socialWhatsapp={(allSettings?.social_whatsapp as string) || undefined}
              socialEitaa={(allSettings?.social_eitaa as string) || undefined}
            />
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
