import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyZarinpalPayment, getCanonicalSiteUrl } from '@/lib/zarinpal'
import { Resend } from 'resend'

async function handlePaymentCallback(request: Request) {
  const siteUrl = getCanonicalSiteUrl(request)

  try {
    const { searchParams } = new URL(request.url)
    let orderId = searchParams.get('order_id')
    let authority = searchParams.get('Authority') || searchParams.get('authority')
    let status = searchParams.get('Status') || searchParams.get('status')

    // Also support POST bodies if sent as form-data or json
    if (request.method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || ''
        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
          const formData = await request.formData()
          orderId = (formData.get('order_id') as string) || orderId
          authority = (formData.get('Authority') as string) || (formData.get('authority') as string) || authority
          status = (formData.get('Status') as string) || (formData.get('status') as string) || status
        } else if (contentType.includes('application/json')) {
          const json = await request.json()
          orderId = json.order_id || orderId
          authority = json.Authority || json.authority || authority
          status = json.Status || json.status || status
        }
      } catch (e) {
        // Continue with searchParams
      }
    }

    if (!authority) {
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?status=failed&message=${encodeURIComponent('اطلاعات تراکنش یا کد اتوریتی یافت نشد.')}`, siteUrl)
      )
    }

    // 1. Fetch order from DB: either by orderId or by payment_authority fallback
    let orders: any[] = []
    if (orderId) {
      orders = await query(`SELECT * FROM yar_orders WHERE id = $1`, [orderId])
    }
    
    // Fallback: If orderId was dropped by banking gateway redirect, look up by authority!
    if (orders.length === 0 && authority) {
      orders = await query(`SELECT * FROM yar_orders WHERE payment_authority = $1`, [authority])
      if (orders.length > 0) {
        orderId = orders[0].id
      }
    }

    if (orders.length === 0) {
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?status=failed&message=${encodeURIComponent('سفارش مربوط به این تراکنش یافت نشد.')}`, siteUrl)
      )
    }

    const order = orders[0]

    // 2. If order was already completed (e.g. customer refreshed or duplicate callback)
    if (order.status === 'completed') {
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?order_id=${order.id}&status=success&ref_id=${order.payment_gateway_ref || ''}`, siteUrl)
      )
    }

    // 3. If Status is not OK (user cancelled or payment failed)
    if (status !== 'OK') {
      await query(
        `UPDATE yar_orders SET status = 'failed' WHERE id = $1`,
        [order.id]
      )
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?order_id=${order.id}&status=failed&message=${encodeURIComponent('پرداخت انجام نشد یا توسط کاربر لغو شد.')}`, siteUrl)
      )
    }

    // 4. Verify transaction with Zarinpal
    const verification = await verifyZarinpalPayment(order.total_cents, authority)

    if (!verification.success) {
      await query(
        `UPDATE yar_orders SET status = 'failed' WHERE id = $1`,
        [order.id]
      )
      const errorMsg = verification.error || 'تایید تراکنش با خطا مواجه شد.'
      return NextResponse.redirect(
        new URL(`/shop/checkout/result?order_id=${order.id}&status=failed&message=${encodeURIComponent(errorMsg)}`, siteUrl)
      )
    }

    // 5. Payment verified successfully!
    const refId = verification.refId || authority
    const cardPan = verification.cardPan || null

    await query(
      `UPDATE yar_orders 
       SET status = 'completed', 
           payment_gateway_ref = $1, 
           payment_card_pan = $2, 
           paid_at = NOW() 
       WHERE id = $3`,
      [refId, cardPan, order.id]
    )

    // 6. Create admin notification
    await query(
      `INSERT INTO yar_admin_notifications (type, title, message, link_url)
       VALUES ($1, $2, $3, $4)`,
      [
        'order',
        `پرداخت آنلاین موفق از ${order.full_name}`,
        `مبلغ: ${order.total_cents / 10} تومان - کد پیگیری: ${refId}`,
        `/admin/store/orders/${order.id}`
      ]
    )

    // 7. Send confirmation email if configured
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
              <p>سفارش: ${order.id}</p>
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

    // 8. Redirect to success result page
    return NextResponse.redirect(
      new URL(`/shop/checkout/result?order_id=${order.id}&status=success&ref_id=${refId}`, siteUrl)
    )
  } catch (error: any) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(
      new URL(`/shop/checkout/result?status=failed&message=${encodeURIComponent('خطای غیرمنتظره در پردازش بازگشت از درگاه.')}`, siteUrl)
    )
  }
}

export async function GET(request: Request) {
  return handlePaymentCallback(request)
}

export async function POST(request: Request) {
  return handlePaymentCallback(request)
}
