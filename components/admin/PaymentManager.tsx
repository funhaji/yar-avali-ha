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
        { key: 'zarinpal_sandbox', value: 'false', type: 'checkbox' }, // Sandbox disabled by default
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
    <div className="space-y-8 max-w-4xl">
      {message && (
        <div className={`p-4 rounded-2xl text-sm font-black flex items-center gap-2 border-2 shadow-xs ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Zarinpal Online Gateway */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal/15 text-teal-800 border-2 border-teal/40 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">درگاه پرداخت اینترنتی زرین‌پال</h2>
              <p className="text-xs md:text-sm text-slate-600 font-medium">پذیرش پرداخت آنلاین از کلیه کارت‌های عضو شبکه شتاب</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Enable Gateway Toggle */}
            <label className="flex items-center justify-between p-4.5 rounded-2xl bg-slate-50 border-2 border-slate-300 cursor-pointer hover:bg-slate-100 transition-all shadow-xs">
              <div>
                <span className="font-black text-slate-900 block text-base">فعال‌سازی درگاه پرداخت آنلاین</span>
                <span className="text-xs text-slate-600 font-medium">در صورت غیرفعال بودن، مشتریان فقط روش کارت به کارت را مشاهده خواهند کرد.</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.payment_gateway_enabled}
                onChange={e => setSettings({ ...settings, payment_gateway_enabled: e.target.checked })}
                className="w-6 h-6 text-teal rounded border-2 border-slate-400 focus:ring-teal cursor-pointer"
              />
            </label>

            {/* Merchant ID / Access Token */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                کد مرچنت یا اکسس توکن زرین‌پال (Merchant ID / Access Token) <span className="text-rose-600">*</span>
              </label>
              <p className="text-xs text-slate-600 font-medium mb-2 leading-relaxed">
                کد ۳۶ رقمی مرچنت زرین‌پال (مثلاً <span className="font-mono text-slate-800 font-bold" dir="ltr">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</span>) یا اکسس توکن معتبر از پنل کاربری زرین‌پال.
              </p>
              <input 
                type="text"
                value={settings.zarinpal_merchant_id}
                onChange={e => setSettings({ ...settings, zarinpal_merchant_id: e.target.value })}
                placeholder="کد مرچنت زرین‌پال..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                dir="ltr"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Card to Card */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal/15 text-teal-800 border-2 border-teal/40 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">اطلاعات حساب جهت واریز کارت به کارت</h2>
              <p className="text-xs md:text-sm text-slate-600 font-medium">این مشخصات در مرحله تسویه حساب برای انتقال وجه به مشتری نمایش داده می‌شود</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                شماره کارت بانکی (۱۶ رقم) <span className="text-rose-600">*</span>
              </label>
              <input 
                type="text"
                value={settings.admin_card_number}
                onChange={e => setSettings({ ...settings, admin_card_number: e.target.value })}
                placeholder="۶۰۳۷-۹۹۷۱-xxxx-xxxx"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-sm tracking-widest outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                نام و نام خانوادگی صاحب حساب <span className="text-rose-600">*</span>
              </label>
              <input 
                type="text"
                value={settings.admin_card_name}
                onChange={e => setSettings({ ...settings, admin_card_name: e.target.value })}
                placeholder="مثلاً: علی احمدی"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-medium outline-none focus:border-teal focus:ring-3 focus:ring-teal/20 transition-all shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* Section 3: 3-Day Expiry Policy & Manual Cleanup */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">سیاست انقضای سفارشات پرداخت‌نشده</h2>
              <p className="text-xs text-slate-600 font-medium">مدیریت خودکار سفارشات معلق</p>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900">حذف خودکار پس از ۳ روز (۷۲ ساعت)</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                هر سفارشی که در وضعیت در انتظار پرداخت باشد و تا ۳ روز پرداخت نشود، به صورت خودکار از سیستم حذف می‌گردد.
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualCleanup}
              disabled={cleaning}
              className="border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 py-2.5 px-4 text-xs font-black rounded-xl whitespace-nowrap flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
            >
              {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-amber-700" />}
              <span>پاکسازی دستی سفارشات منقضی‌شده</span>
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="py-3.5 px-8 text-sm font-black text-white bg-teal hover:bg-teal-deep border-2 border-teal-700 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>ذخیره تنظیمات درگاه و پرداخت</span>
          </button>
        </div>
      </form>
    </div>
  )
}
