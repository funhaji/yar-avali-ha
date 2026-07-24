import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-vazir', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'یار اولی‌ها | یادگیری که مزه دارد', template: '%s | یار اولی‌ها' },
  description: 'دنیای خلاق آموزش و سرگرمی برای کودکان دبستانی؛ با درس‌های تصویری، تمرین‌های جذاب و معلم‌های دوست‌داشتنی.',
  keywords: ['آموزش کودکان', 'کلاس اول', 'محتوای آموزشی', 'سرگرمی کودک'],
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf3e4' },
    { media: '(prefers-color-scheme: dark)', color: '#171522' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const themeScript = `
(() => {
  try {
    const saved = localStorage.getItem('yar-avali-theme');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className="bg-background" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className={`${vazirmatn.variable} font-sans`}>{children}</body>
    </html>
  )
}
