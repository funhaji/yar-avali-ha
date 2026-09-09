import Link from 'next/link'
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, Download, Package, ExternalLink, ShieldCheck } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'

export default async function CheckoutResultPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const orderId = params.order_id || ''
  const status = params.status || 'unknown'
  const refId = params.ref_id || ''
  const errorMessage = params.message || 'خطا در انجام عملیات بانکی.'

  const isSuccess = status === 'success'

  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  const settings = await getSettings(['site_name', 'site_logo_url', 'contact_phone', 'contact_telegram_id'])

  let order: any = null
  let orderItems: any[] = []

  if (orderId) {
    const orders = await query('SELECT * FROM yar_orders WHERE id = $1', [orderId])
    if (orders.length > 0) {
      order = orders[0]
      orderItems = await query(
        `SELECT oi.*, s.title, s.thumbnail_url, s.is_digital, s.is_downloadable, s.file_url, s.content_type
         FROM yar_order_items oi
         JOIN yar_store_items s ON oi.store_item_id = s.id
         WHERE oi.order_id = $1`,
        [orderId]
      )
    }
  }

  const hasDigital = orderItems.some(i => i.is_digital)
  const hasPhysical = orderItems.some(i => !i.is_digital)

  return (
    <div className="page bg-cream min-h-screen flex flex-col">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'}
        siteName={settings.site_name || undefined}
        siteLogo={settings.site_logo_url || undefined}
      />

      <main className="shell py-12 flex-1 max-w-3xl mx-auto w-full">
        {isSuccess ? (
          <div className="card p-6 md:p-10 slide-up border-2 border-green-200/80 bg-paper shadow-xl rounded-3xl">
            {/* Header Success Status */}
            <div className="flex flex-col items-center text-center pb-8 border-b border-line-soft">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-ink mb-2">پرداخت با موفقیت انجام شد!</h1>
              <p className="text-ink-soft text-base">از خرید شما سپاسگزاریم. سفارش شما با موفقیت ثبت و تایید گردید.</p>
            </div>

            {/* Receipt Summary Info */}
            <div className="py-6 space-y-4 text-sm md:text-base border-b border-line-soft">
              <div className="flex items-center justify-between py-2 border-b border-dashed border-line-soft/80">
                <span className="text-ink-soft">شماره پیگیری پرداخت:</span>
                <span className="font-mono font-bold text-teal-deep text-lg" dir="ltr">{refId || order?.payment_gateway_ref || '---'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dashed border-line-soft/80">
                <span className="text-ink-soft">شماره سفارش:</span>
                <span className="font-mono font-bold text-ink" dir="ltr">{orderId ? orderId.slice(0, 13) + '...' : '---'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dashed border-line-soft/80">
                <span className="text-ink-soft">مبلغ پرداختی:</span>
                <span className="font-bold text-teal-deep text-xl">
                  {order ? (order.total_cents / 10).toLocaleString() : '---'} تومان
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dashed border-line-soft/80">
                <span className="text-ink-soft">روش پرداخت:</span>
                <span className="font-bold text-ink">درگاه پرداخت اینترنتی زرین‌پال</span>
              </div>
              {order?.full_name && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-ink-soft">خریدار:</span>
                  <span className="font-bold text-ink">{order.full_name}</span>
                </div>
              )}
            </div>

            {/* Purchased Items */}
            {orderItems.length > 0 && (
              <div className="py-6 border-b border-line-soft">
                <h3 className="font-bold text-lg mb-4 text-ink flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-teal" /> اقلام سفارش
                </h3>
                <div className="space-y-3">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-cream/40 border border-line-soft">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-paper overflow-hidden border border-line-soft shrink-0 flex items-center justify-center">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-ink-soft opacity-40" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-ink line-clamp-1">{item.title}</div>
                          <div className="text-xs text-ink-soft">
                            {item.quantity} عدد × {(item.price_cents / 10).toLocaleString()} تومان
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-line-soft text-ink-soft">
                        {item.is_digital ? 'دیجیتال' : 'فیزیکی'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Digital Items Notice */}
            {hasDigital && (
              <div className="my-6 p-5 rounded-2xl bg-teal/10 border border-teal/20 text-teal-deep flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                    <Download className="w-5 h-5 text-teal" /> فایل‌های دیجیتال آماده دسترسی هستند!
                  </h4>
                  <p className="text-xs sm:text-sm text-ink-soft">
                    محصولات دیجیتال بلافاصله به پنل کاربری شما اضافه شدند و می‌توانید آن‌ها را دانلود یا مشاهده کنید.
                  </p>
                </div>
                <Link href="/dashboard" className="button bg-teal text-white hover:bg-teal-deep whitespace-nowrap text-sm shrink-0 shadow-md">
                  رفتن به پنل کاربری
                </Link>
              </div>
            )}

            {/* Physical Items Notice */}
            {hasPhysical && (
              <div className="my-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                <span className="font-bold block mb-1">📦 ارسال اقلام فیزیکی:</span>
                اقلام فیزیکی سفارش شما ثبت شده و به زودی جهت ارسال آماده‌سازی می‌گردد. در صورت نیاز به هماهنگی، کارشناسان ما با شما تماس خواهند گرفت.
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/dashboard" className="button button-primary w-full sm:w-auto justify-center button-lg">
                مشاهده در پنل کاربری
              </Link>
              <Link href="/shop" className="button button-ghost border border-line-soft w-full sm:w-auto justify-center">
                بازگشت به فروشگاه <ArrowRight className="w-4 h-4 mr-2" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="card p-6 md:p-10 slide-up border-2 border-berry/30 bg-paper shadow-xl rounded-3xl text-center">
            {/* Header Failed Status */}
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-berry mx-auto mb-5 shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-ink mb-3">پرداخت ناموفق بود</h1>
            <p className="text-ink-soft text-base mb-6 max-w-md mx-auto leading-relaxed">
              {errorMessage}
            </p>

            {orderId && (
              <div className="bg-cream/50 p-4 rounded-2xl border border-line-soft inline-block mb-8 text-sm">
                <span className="text-ink-soft ml-2">شناسه سفارش:</span>
                <span className="font-mono font-bold text-ink" dir="ltr">{orderId}</span>
              </div>
            )}

            {/* Action Buttons for retry */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Link href="/dashboard#orders" className="button button-primary w-full sm:w-auto justify-center button-lg">
                تکمیل یا پرداخت مجدد سفارش در پیشخوان
              </Link>
              <Link href="/shop" className="button button-ghost border border-line-soft w-full sm:w-auto justify-center">
                بازگشت به فروشگاه
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-line-soft text-xs text-ink-soft">
              اگر مبلغ از حساب شما کسر شده است، معمولاً ظرف ۷۲ ساعت توسط بانک به حسابتان برگشت داده خواهد شد. در صورت بروز هرگونه سوال با پشتیبانی تماس بگیرید.
              {settings.contact_phone && (
                <div className="mt-2 font-bold text-ink" dir="ltr">تلفن: {settings.contact_phone}</div>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
