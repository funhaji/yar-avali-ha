import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { name, display_order = 0, is_active = true } = await request.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'نام پایه الزامی است' }, { status: 400 })
    }
    const rows = await query(
      'INSERT INTO yar_tutoring_grades (name, display_order, is_active) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), Number(display_order) || 0, is_active ?? true]
    )
    return NextResponse.json({ grade: rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { id, name, display_order, is_active } = await request.json()
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: 'شناسه و نام الزامی است' }, { status: 400 })
    }
    const rows = await query(
      'UPDATE yar_tutoring_grades SET name = $1, display_order = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name.trim(), Number(display_order) || 0, is_active ?? true, id]
    )
    return NextResponse.json({ grade: rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'شناسه الزامی است' }, { status: 400 })
    await query('DELETE FROM yar_tutoring_grades WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
