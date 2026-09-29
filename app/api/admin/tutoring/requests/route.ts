import { NextResponse } from 'next/server'
import { requireAdmin, getTutoringRequests } from '@/lib/teachers'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const requests = await getTutoringRequests(status)
    return NextResponse.json({ requests })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'شناسه و وضعیت الزامی است' }, { status: 400 })
    }
    const rows = await query(
      'UPDATE yar_tutoring_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    return NextResponse.json({ request: rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'شناسه الزامی است' }, { status: 400 })
    await query('DELETE FROM yar_tutoring_requests WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
