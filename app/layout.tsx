import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { CartProvider } from '@/lib/store-context'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { SupportBubbleWrapper } from '@/components/SupportBubbleWrapper'
import { getSettings } from '@/lib/settings'

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-vazir', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const settings: Record<string, string | null> = await getSettings(['site_name', 'site_logo_url']).catch(() => ({}))
  const siteName = (settings?.site_name as string) || 'یار اولی‌ها'
  const logoUrl = (settings?.site_logo_url as string) || '/favicon.ico'
  
  return {
    title: { default: `${siteName} | یادگیری که مزه دارد`, template: `%s | ${siteName}` },
    description: 'دنیای خلاق آموزش و سرگرمی برای کودکان دبستانی؛ با درس‌های تصویری، تمرین‌های جذاب و معلم‌های دوست‌داشتنی.',
    keywords: ['آموزش کودکان', 'کلاس اول', 'محتوای آموزشی', 'سرگرمی کودک'],
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
    'social_whatsapp'
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
          />
        </CartProvider>
      </body>
    </html>
  )
}
