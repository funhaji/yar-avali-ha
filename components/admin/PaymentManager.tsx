'use client'

import { useState } from 'react'
import { CreditCard, Globe, ShieldCheck, Save, Trash2, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

type Props = {
  initialSettings: Record<string, string>
}

export function PaymentManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState({
    payment_gateway_enabled: initialSettings.payment_gateway_enabled === 'true',
    zarinpal_merchant_id: initialSettings.zarinpal_merchant_id || '',
    zarinpal_sandbox: initialSettings.zarinpal_sandbox === 'true',
    admin_card_number: initialSettings.admin_card_number || '',
    admin_card_name: initialSettings.admin_card_name || ''
  })

  const [saving, setSaving] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = [
        { key: 'payment_gateway_enabled', value: settings.payment_gateway_enabled ? 'true' : 'false', type: 'checkbox' },
        { key: 'zarinpal_merchant_id', value: settings.zarinpal_merchant_id.trim(), type: 'text' },
        { key: 'zarinpal_sandbox', value: settings.zarinpal_sandbox ? 'true' : 'false', type: 'checkbox' },
        { key: 'admin_card_number', value: settings.admin_card_number.trim(), type: 'text' },
        { key: 'admin_card_name', value: settings.admin_card_name.trim(), type: 'text' }
      ]

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload })
      })

      if (res.ok) {
        showToast('تنظیمات درگاه و پرداخت با موفقیت ذخیره شد.')
      } else {
        const data = await res.json()
        showToast(data.error || 'خطا در ذخیره تنظیمات', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleManualCleanup = async () => {
    if (!confirm('آیا مایلید تمام سفارش‌های پرداخت‌نشده قدیمی‌تر از ۳ روز پاکسازی شوند؟')) return

    setCleaning(true)
    try {
      const res = await fetch('/api/admin/orders/cleanup', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        showToast(`پاکسازی با موفقیت انجام شد: ${data.deletedCount} سفارش منقضی‌شده حذف گردید.`)
      } else {
        showToast(data.error || 'خطا در پاکسازی سفارشات', 'error')
      }
    } catch {
      showToast('خطای ارتباط با سرور', 'error')
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl slide-up">
      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 slide-up ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Zarinpal Online Gateway */}
        <section className="card p-6 md:p-8 rounded-3xl bg-paper border border-line-soft space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-line-soft">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">درگاه پرداخت اینترنتی زرین‌پال</h2>
              <p className="text-xs md:text-sm text-ink-soft">پذیرش پرداخت آنلاین از کلیه کارت‌های عضو شبکه شتاب</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Enable Gateway Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-cream/50 border border-line-soft cursor-pointer hover:bg-cream transition-colors">
              <div>
                <span className="font-bold text-ink block text-base">فعال‌سازی درگاه پرداخت آنلاین</span>
                <span className="text-xs text-ink-soft">در صورت غیرفعال بودن، مشتریان فقط روش کارت به کارت را مشاهده خواهند کرد.</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.payment_gateway_enabled}
                onChange={e => setSettings({ ...settings, payment_gateway_enabled: e.target.checked })}
                className="w-6 h-6 text-teal rounded focus:ring-teal cursor-pointer"
              />
            </label>

            {/* Merchant ID / Access Token */}
            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">
                کد مرچنت یا اکسس توکن زرین‌پال (Merchant ID / Access Token) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-ink-soft mb-2 leading-relaxed">
                کد ۳۶ رقمی مرچنت زرین‌پال (مثلاً <span className="font-mono" dir="ltr">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</span>) یا اکسس توکن معتبر از پنل کاربری زرین‌پال.
              </p>
              <input 
                type="text"
                value={settings.zarinpal_merchant_id}
                onChange={e => setSettings({ ...settings, zarinpal_merchant_id: e.target.value })}
                placeholder="کد مرچنت زرین‌پال..."
                className="w-full px-4 py-3.5 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:border-teal font-mono text-sm outline-none transition-all"
                dir="ltr"
              />
            </div>

            {/* Sandbox Mode Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-cream/50 border border-line-soft cursor-pointer hover:bg-cream transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink block text-base">حالت آزمایشی زرین‌پال (Sandbox)</span>
                  {settings.zarinpal_sandbox && (
                    <span className="badge bg-amber-100 text-amber-800 border-amber-300 text-xs">فعال (تستی)</span>
                  )}
                </div>
                <span className="text-xs text-ink-soft">
                  صرفاً برای آزمایش سیستم توسعه‌دهندگان (sandbox.zarinpal.com). در سایت واقعی حتماً خاموش باشد.
                </span>
              </div>
              <input 
                type="checkbox"
                checked={settings.zarinpal_sandbox}
                onChange={e => setSettings({ ...settings, zarinpal_sandbox: e.target.checked })}
                className="w-6 h-6 text-teal rounded focus:ring-teal cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Section 2: Card to Card */}
        <section className="card p-6 md:p-8 rounded-3xl bg-paper border border-line-soft space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-line-soft">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">اطلاعات حساب جهت واریز کارت به کارت</h2>
              <p className="text-xs md:text-sm text-ink-soft">این مشخصات در مرحله تسویه حساب برای انتقال وجه به مشتری نمایش داده می‌شود</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">
                شماره کارت بانکی (۱۶ رقم) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={settings.admin_card_number}
                onChange={e => setSettings({ ...settings, admin_card_number: e.target.value })}
                placeholder="۶۰۳۷-۹۹۷۱-xxxx-xxxx"
                className="w-full px-4 py-3.5 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:border-teal font-mono text-sm tracking-widest outline-none transition-all"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">
                نام و نام خانوادگی صاحب حساب <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={settings.admin_card_name}
                onChange={e => setSettings({ ...settings, admin_card_name: e.target.value })}
                placeholder="مثلاً: علی احمدی"
                className="w-full px-4 py-3.5 rounded-xl border border-line-soft bg-gray-50 focus:bg-white focus:border-teal text-sm outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Section 3: 3-Day Expiry Policy & Manual Cleanup */}
        <section className="card p-6 md:p-8 rounded-3xl bg-paper border border-line-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-line-soft">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink">سیاست انقضای سفارشات پرداخت‌نشده</h2>
              <p className="text-xs text-ink-soft">مدیریت خودکار سفارشات معلق</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cream/60 border border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-ink">حذف خودکار پس از ۳ روز (۷۲ ساعت)</p>
              <p className="text-xs text-ink-soft">
                هر سفارشی که در وضعیت در انتظار پرداخت باشد و تا ۳ روز پرداخت نشود، به صورت خودکار از سیستم حذف می‌گردد.
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualCleanup}
              disabled={cleaning}
              className="button button-ghost border border-amber-300 text-amber-900 hover:bg-amber-100 py-2.5 px-4 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>پاکسازی دستی سفارشات منقضی‌شده</span>
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="button button-primary py-3.5 px-8 text-base font-bold rounded-2xl shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>ذخیره تنظیمات درگاه و پرداخت</span>
          </button>
        </div>
      </form>
    </div>
  )
}
