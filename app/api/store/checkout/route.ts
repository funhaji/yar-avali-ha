import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getCart, clearCart } from '@/lib/cart'
import { query } from '@/lib/db'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cart = await getCart(user.id)
    if (cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const body = await request.json()
    const { full_name, phone, shipping_address, notes, payment_method, postal_code, receipt_url } = body

    // Calculate total
    let total_cents = 0
    for (const item of cart) {
      const price = item.discount_price_cents !== null ? item.discount_price_cents : (item.price_cents || 0)
      total_cents += price * item.quantity
    }

    const initialStatus = payment_method === 'gateway' ? 'pending_payment' : 'pending_approval'

    // 1. Create order
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

    // 3. Clear cart
    await clearCart(user.id)

    // 4. Create admin notification
    await query(
      `INSERT INTO yar_admin_notifications (type, title, message, link_url)
       VALUES ($1, $2, $3, $4)`,
      [
        'order', 
        `سفارش جدید از ${full_name || user.name}`, 
        `مبلغ: ${total_cents / 10} تومان`,
        `/admin/store/orders/${orderId}`
      ]
    )

    // 5. Send Email via Resend if API key exists
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
              <p><a href="https://yourwebsite.com/admin/store/orders/${orderId}">مشاهده سفارش</a></p>
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
