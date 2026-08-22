import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    
    await query(`
      UPDATE yar_orders 
      SET status = $1 
      WHERE id = $2
    `, [body.status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order status error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
