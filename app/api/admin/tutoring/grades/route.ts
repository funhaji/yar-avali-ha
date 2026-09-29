import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { name, category = 'ابتدایی', display_order = 0, is_active = true } = await request.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'نام پایه الزامی است' }, { status: 400 })
    }
    const cleanCategory = (category && category.trim()) ? category.trim() : 'ابتدایی'
    const rows = await query(
      'INSERT INTO yar_tutoring_grades (name, category, display_order, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), cleanCategory, Number(display_order) || 0, is_active ?? true]
    )
    return NextResponse.json({ grade: rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const { id, name, category, display_order, is_active } = await request.json()
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: 'شناسه و نام الزامی است' }, { status: 400 })
    }
    const cleanCategory = (category && category.trim()) ? category.trim() : 'ابتدایی'
    const rows = await query(
      'UPDATE yar_tutoring_grades SET name = $1, category = $2, display_order = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [name.trim(), cleanCategory, Number(display_order) || 0, is_active ?? true, id]
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
