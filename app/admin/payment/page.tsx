import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { PaymentManager } from '@/components/admin/PaymentManager'
import { requireAdmin } from '@/lib/teachers'
import { getSettings } from '@/lib/settings'

export default async function AdminPaymentPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const settings = await getSettings([
    'payment_gateway_enabled',
    'zarinpal_merchant_id',
    'zarinpal_sandbox',
    'admin_card_number',
    'admin_card_name'
  ])

  return (
    <div className="page bg-cream min-h-screen">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section py-8 md:py-12">
        <div className="mb-8">
          <span className="section-kicker"><CreditCard /> مدیریت امور مالی</span>
          <h1 className="section-title text-2xl md:text-3xl font-black text-ink mb-2">تنظیمات درگاه پرداخت و کارت به کارت</h1>
          <p className="text-sm text-ink-soft">پیکربندی مرچنت کد درگاه زرین‌پال، شماره حساب بانکی و مدیریت سفارشات معلق</p>
        </div>
        <PaymentManager initialSettings={settings} />
      </main>
    </div>
  )
}
