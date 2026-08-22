import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/teachers'

// POST: Reorder slides
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { slides } = await request.json()

    // Update display order for each slide
    for (const slide of slides) {
      await query(
        'UPDATE yar_homepage_slides SET display_order = $1, updated_at = NOW() WHERE id = $2',
        [slide.display_order, slide.id]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slider reorder error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
