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

    const orders = await query<any>(
      `SELECT * FROM yar_orders WHERE id = $1 AND user_id = $2`,
      [orderId, user.id]
    )

    if (orders.length === 0) {
      return NextResponse.json({ error: 'سفارش یافت نشد.' }, { status: 404 })
    }

    const order = orders[0]

    if (order.status === 'completed' || order.status === 'approved') {
      return NextResponse.json({ error: 'امکان لغو سفارش پرداخت‌شده وجود ندارد.' }, { status: 400 })
    }

    // Delete or mark cancelled
    await query(
      `UPDATE yar_orders SET status = 'cancelled' WHERE id = $1`,
      [orderId]
    )

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت لغو شد.'
    })
  } catch (error: any) {
    console.error('Order cancel error:', error)
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 })
  }
}
