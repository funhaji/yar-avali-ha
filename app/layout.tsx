import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'یار اولی‌ها - پلتفرم آموزشی و سرگرمی کودکان',
  description: 'پلتفرم آموزشی و سرگرمی برای کودکان پیش‌دبستانی و کلاس اول با محتوای درسی و سرگرمی',
  keywords: 'آموزش کودکان، پیش‌دبستانی، کلاس اول، انیمه، فیلم کودکان، آموزش فارسی',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
