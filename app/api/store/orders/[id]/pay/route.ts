import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { requestZarinpalPayment, getCanonicalSiteUrl } from '@/lib/zarinpal'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: orderId } = await params

    const orders = await query<any>(
      `SELECT * FROM yar_orders WHERE id = $1 AND user_id = $2`,
      [orderId, user.id]
    )

    if (orders.length === 0) {
      return NextResponse.json({ error: 'سفارش یافت نشد.' }, { status: 404 })
    }

    const order = orders[0]

    if (order.status === 'completed' || order.status === 'approved') {
      return NextResponse.json({ error: 'این سفارش قبلاً پرداخت و تکمیل شده است.' }, { status: 400 })
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'این سفارش لغو شده است.' }, { status: 400 })
    }

    // Check 3-day expiry
    const createdAt = new Date(order.created_at).getTime()
    const now = Date.now()
    if (now - createdAt > 3 * 24 * 60 * 60 * 1000) {
      // Auto-delete expired order
      await query(`DELETE FROM yar_orders WHERE id = $1`, [orderId])
      return NextResponse.json({ error: 'مهلت پرداخت ۳ روزه این سفارش به پایان رسیده و سفارش حذف شد.' }, { status: 400 })
    }

    // Initiate Zarinpal Gateway
    const siteUrl = getCanonicalSiteUrl(request)
    const callbackUrl = `${siteUrl}/api/store/payment/callback?order_id=${order.id}`

    const zarinResult = await requestZarinpalPayment({
      amount: order.total_cents,
      description: `پرداخت سفارش شماره ${order.id.slice(0, 8)} در سایت یار اولی‌ها`,
      orderId: order.id,
      callbackUrl,
      mobile: order.phone || user.phone,
      email: user.email
    })

    if (!zarinResult.success || !zarinResult.paymentUrl) {
      return NextResponse.json({
        error: zarinResult.error || 'خطا در ارتباط با درگاه پرداخت زرین‌پال'
      }, { status: 400 })
    }

    // Update order with new authority and payment method
    await query(
      `UPDATE yar_orders 
       SET payment_authority = $1, payment_method = 'gateway', status = 'pending_payment' 
       WHERE id = $2`,
      [zarinResult.authority, order.id]
    )

    return NextResponse.json({
      success: true,
      paymentUrl: zarinResult.paymentUrl
    })
  } catch (error: any) {
    console.error('Order pay error:', error)
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 })
  }
}
