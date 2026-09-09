import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyZarinpalPayment } from '@/lib/zarinpal'
import { Resend } from 'resend'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const authority = searchParams.get('Authority')
    const status = searchParams.get('Status')

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const siteUrl = `${proto}://${host}`

    if (!orderId || !authority) {
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?status=failed&message=${encodeURIComponent('اطلاعات تراکنش نامعتبر است.')}`, siteUrl)
      )
    }

    // Fetch order from DB
    const orders = await query(
      `SELECT * FROM yar_orders WHERE id = $1`,
      [orderId]
    )

    if (orders.length === 0) {
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?status=failed&message=${encodeURIComponent('سفارش مورد نظر یافت نشد.')}`, siteUrl)
      )
    }

    const order = orders[0]

    // If order is already completed
    if (order.status === 'completed') {
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?order_id=${orderId}&status=success&ref_id=${order.payment_gateway_ref || ''}`, siteUrl)
      )
    }

    // If status from Zarinpal is not OK (user canceled or transaction failed at bank)
    if (status !== 'OK') {
      await query(
        `UPDATE yar_orders SET status = 'failed' WHERE id = $1`,
        [orderId]
      )
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?order_id=${orderId}&status=failed&message=${encodeURIComponent('پرداخت انجام نشد یا توسط کاربر لغو شد.')}`, siteUrl)
      )
    }

    // Verify payment with Zarinpal
    const verification = await verifyZarinpalPayment(order.total_cents, authority)

    if (!verification.success) {
      await query(
        `UPDATE yar_orders SET status = 'failed' WHERE id = $1`,
        [orderId]
      )
      const errorMsg = verification.error || 'تایید تراکنش با خطا مواجه شد.'
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?order_id=${orderId}&status=failed&message=${encodeURIComponent(errorMsg)}`, siteUrl)
      )
    }

    // Payment succeeded! Update order status to completed
    const refId = verification.refId || authority
    const cardPan = verification.cardPan || null

    await query(
      `UPDATE yar_orders 
       SET status = 'completed', 
           payment_gateway_ref = $1, 
           payment_card_pan = $2, 
           paid_at = NOW() 
       WHERE id = $3`,
      [refId, cardPan, orderId]
    )

    // Create admin notification
    await query(
      `INSERT INTO yar_admin_notifications (type, title, message, link_url)
       VALUES ($1, $2, $3, $4)`,
      [
        'order',
        `پرداخت آنلاین موفق از ${order.full_name}`,
        `مبلغ: ${order.total_cents / 10} تومان - کد پیگیری: ${refId}`,
        `/admin/store/orders/${orderId}`
      ]
    )

    // Send confirmation email via Resend if available
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Shop <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: 'پرداخت آنلاین موفق سفارش 🎉',
          html: `
            <div dir="rtl" style="font-family: Tahoma, sans-serif;">
              <h2>پرداخت آنلاین موفق! 🎉</h2>
              <p>سفارش: ${orderId}</p>
              <p>مشتری: ${order.full_name}</p>
              <p>شماره تماس: ${order.phone}</p>
              <p>مبلغ پرداختی: ${order.total_cents / 10} تومان</p>
              <p>کد پیگیری درگاه: ${refId}</p>
              ${cardPan ? `<p>شماره کارت: ${cardPan}</p>` : ''}
            </div>
          `
        })
      } catch (e) {
        console.error('Failed to send Resend email:', e)
      }
    }

    // Redirect user to result page
    return NextResponse.redirect(
      new URL(`/shop/checkout/result?order_id=${orderId}&status=success&ref_id=${refId}`, siteUrl)
    )
  } catch (error: any) {
    console.error('Payment callback error:', error)
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const siteUrl = `${proto}://${host}`
    return NextResponse.redirect(
      new URL(`/shop/checkout/result?status=failed&message=${encodeURIComponent('خطای غیرمنتظره سرور در پردازش بازگشت از درگاه.')}`, siteUrl)
    )
  }
}
