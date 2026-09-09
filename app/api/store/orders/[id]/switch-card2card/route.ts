import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'

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
    const body = await request.json()
    const { receipt_url } = body

    if (!receipt_url) {
      return NextResponse.json({ error: 'لطفاً تصویر رسید واریز را ارسال نمایید.' }, { status: 400 })
    }

    const orders = await query<any>(
      `SELECT * FROM yar_orders WHERE id = $1 AND user_id = $2`,
      [orderId, user.id]
    )

    if (orders.length === 0) {
      return NextResponse.json({ error: 'سفارش یافت نشد.' }, { status: 404 })
    }

    const order = orders[0]

    if (order.status === 'completed' || order.status === 'approved') {
      return NextResponse.json({ error: 'این سفارش قبلاً تایید شده است.' }, { status: 400 })
    }

    await query(
      `UPDATE yar_orders 
       SET payment_method = 'card2card', receipt_url = $1, status = 'pending_approval'
       WHERE id = $2`,
      [receipt_url, orderId]
    )

    return NextResponse.json({
      success: true,
      message: 'رسید پرداخت با موفقیت ثبت شد و در انتظار تایید مدیریت قرار گرفت.'
    })
  } catch (error: any) {
    console.error('Order switch-card2card error:', error)
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 })
  }
}
