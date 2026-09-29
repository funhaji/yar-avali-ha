import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const orders = await query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM yar_orders o
      LEFT JOIN yar_users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id])

    if (orders.length === 0) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })
    }

    const items = await query(`
      SELECT oi.*, s.title, s.thumbnail_url, s.is_digital
      FROM yar_order_items oi
      JOIN yar_store_items s ON oi.store_item_id = s.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `, [id])

    return NextResponse.json({ order: { ...orders[0], items } })
  } catch (error: any) {
    console.error('Fetch order error:', error)
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const {
      status,
      full_name,
      phone,
      shipping_address,
      postal_code,
      tracking_code,
      total_cents,
      payment_method,
      payment_gateway_ref,
      payment_card_pan,
      notes,
      items
    } = body

    await query(`
      UPDATE yar_orders 
      SET 
        status = COALESCE($1, status),
        full_name = COALESCE($2, full_name),
        phone = COALESCE($3, phone),
        shipping_address = $4,
        postal_code = $5,
        tracking_code = $6,
        total_cents = COALESCE($7, total_cents),
        payment_method = $8,
        payment_gateway_ref = $9,
        payment_card_pan = $10,
        notes = $11
      WHERE id = $12
    `, [
      status,
      full_name,
      phone,
      shipping_address ?? null,
      postal_code ?? null,
      tracking_code ?? null,
      total_cents !== undefined ? Number(total_cents) : null,
      payment_method ?? null,
      payment_gateway_ref ?? null,
      payment_card_pan ?? null,
      notes ?? null,
      id
    ])

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.id && item.deleted) {
          await query(`DELETE FROM yar_order_items WHERE id = $1 AND order_id = $2`, [item.id, id])
        } else if (item.id) {
          await query(`
            UPDATE yar_order_items 
            SET quantity = $1, price_cents = $2 
            WHERE id = $3 AND order_id = $4
          `, [Number(item.quantity) || 1, Number(item.price_cents) || 0, item.id, id])
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: error.message || 'خطا در ویرایش سفارش' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const deleted = await query(`DELETE FROM yar_orders WHERE id = $1 RETURNING id`, [id])
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: error.message || 'خطا در حذف سفارش' }, { status: 500 })
  }
}
