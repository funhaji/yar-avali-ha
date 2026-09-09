import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getCart, clearCart } from '@/lib/cart'
import { query } from '@/lib/db'
import { Resend } from 'resend'
import { requestZarinpalPayment, getCanonicalSiteUrl } from '@/lib/zarinpal'
import { cleanupExpiredOrders } from '@/lib/orders'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const fullCart = await getCart(user.id)

    const body = await request.json()
    const { full_name, phone, shipping_address, notes, payment_method, postal_code, receipt_url, selected_item_ids } = body

    let cart = fullCart
    if (selected_item_ids && Array.isArray(selected_item_ids) && selected_item_ids.length > 0) {
      cart = fullCart.filter(item => selected_item_ids.includes(item.id))
    }

    if (cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Auto-cleanup any old expired orders for this user
    await cleanupExpiredOrders(user.id);

    // Mixed cart validation: if any physical item is in cart, require shipping details
    const hasPhysicalItems = cart.some(item => !item.is_digital);
    if (hasPhysicalItems) {
      if (!shipping_address || shipping_address.trim().length < 5) {
        return NextResponse.json({
          error: 'سفارش شما شامل کالای فیزیکی است. لطفاً آدرس پستی دقیق خود را وارد نمایید.'
        }, { status: 400 });
      }
      if (!postal_code || postal_code.trim().length < 5) {
        return NextResponse.json({
          error: 'سفارش شما شامل کالای فیزیکی است. لطفاً کد پستی معتبر را وارد نمایید.'
        }, { status: 400 });
      }
      if (!phone || phone.trim().length < 8) {
        return NextResponse.json({
          error: 'لطفاً شماره تماس معتبر جهت هماهنگی ارسال وارد نمایید.'
        }, { status: 400 });
      }
    }

    // Calculate total (in Rials: price_cents = Tomans * 10)
    let total_cents = 0
    for (const item of cart) {
      const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
      total_cents += price * item.quantity
    }

    const isFree = total_cents === 0

    // Validate minimum Shetab banking transaction for gateway (minimum 10,000 Rials / 1,000 Tomans)
    if (payment_method === 'gateway' && !isFree && total_cents < 10000) {
      return NextResponse.json({
        error: 'حداقل مبلغ جهت پرداخت آنلاین بانکی ۱,۰۰۰ تومان است. برای مبالغ کمتر لطفاً روش کارت به کارت را انتخاب نمایید.'
      }, { status: 400 })
    }

    const initialStatus = isFree ? 'completed' : (payment_method === 'gateway' ? 'pending_payment' : 'pending_approval')

    // 1. Create order in database
    const orderResult = await query(
      `INSERT INTO yar_orders (user_id, full_name, phone, shipping_address, total_cents, notes, payment_method, postal_code, receipt_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        user.id, 
        full_name || user.name, 
        phone || user.phone || '000', 
        shipping_address || '', 
        total_cents, 
        notes || '',
        payment_method || 'card2card',
        postal_code || '',
        receipt_url || '',
        initialStatus
      ]
    )
    const orderId = orderResult[0].id

    // 2. Add order items
    for (const item of cart) {
      const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
      await query(
        `INSERT INTO yar_order_items (order_id, store_item_id, quantity, price_cents)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.store_item_id, item.quantity, price]
      )
    }

    // 3. Clear selected items from cart
    if (selected_item_ids && Array.isArray(selected_item_ids) && selected_item_ids.length > 0) {
      for (const item of cart) {
        await query('DELETE FROM yar_cart_items WHERE id = $1 AND user_id = $2', [item.id, user.id])
      }
    } else {
      await clearCart(user.id)
    }

    // 4. If online payment gateway (and not free), initiate Zarinpal payment request
    if (payment_method === 'gateway' && !isFree) {
      const siteUrl = getCanonicalSiteUrl(request)
      const callbackUrl = `${siteUrl}/api/store/payment/callback?order_id=${orderId}`

      const zarinResult = await requestZarinpalPayment({
        amount: total_cents,
        description: `سفارش شماره ${orderId.slice(0, 8)} در سایت یار اولی‌ها`,
        orderId,
        callbackUrl,
        mobile: phone || user.phone,
        email: user.email
      })

      if (!zarinResult.success || !zarinResult.paymentUrl) {
        return NextResponse.json({
          error: zarinResult.error || 'خطا در اتصال به درگاه پرداخت زرین‌پال'
        }, { status: 400 })
      }

      // Save authority to order
      await query(
        `UPDATE yar_orders SET payment_authority = $1 WHERE id = $2`,
        [zarinResult.authority, orderId]
      )

      return NextResponse.json({
        success: true,
        orderId,
        paymentUrl: zarinResult.paymentUrl
      })
    }

    // 5. Create admin notification for card2card or free orders
    await query(
      `INSERT INTO yar_admin_notifications (type, title, message, link_url)
       VALUES ($1, $2, $3, $4)`,
      [
        'order', 
        `سفارش جدید از ${full_name || user.name}`, 
        `مبلغ: ${total_cents / 10} تومان (${payment_method === 'card2card' ? 'کارت به کارت' : 'رایگان'})`,
        `/admin/store/orders/${orderId}`
      ]
    )

    // 6. Send Email via Resend if configured
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Shop <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: 'سفارش جدید در سایت',
          html: `
            <div dir="rtl" style="font-family: Tahoma, sans-serif;">
              <h2>سفارش جدید! 🎉</h2>
              <p>مشتری: ${full_name || user.name}</p>
              <p>شماره تماس: ${phone || user.phone}</p>
              <p>مبلغ کل: ${total_cents / 10} تومان</p>
              <p>روش پرداخت: ${payment_method === 'card2card' ? 'کارت به کارت' : 'رایگان'}</p>
            </div>
          `
        })
      } catch (e) {
        console.error('Failed to send Resend email:', e)
      }
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Checkout API POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
