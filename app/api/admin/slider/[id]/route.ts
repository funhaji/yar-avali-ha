import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/teachers'

// PATCH: Update slide
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params
    const { is_active } = await request.json()

    await query(
      'UPDATE yar_homepage_slides SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [is_active, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slider PATCH error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE: Delete slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params

    await query('DELETE FROM yar_homepage_slides WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slider DELETE error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
