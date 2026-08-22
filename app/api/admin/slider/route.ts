import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/teachers'

// GET: Get all slides
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const slides = await query(
      'SELECT * FROM yar_homepage_slides ORDER BY display_order ASC, created_at DESC'
    )

    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Slider GET error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST: Create new slide
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { image_url, title, link_url, display_order } = await request.json()

    if (!image_url) {
      return NextResponse.json({ error: 'تصویر الزامی است' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO yar_homepage_slides (image_url, title, link_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [image_url, title, link_url, display_order || 0]
    )

    return NextResponse.json({ slide: result[0] })
  } catch (error) {
    console.error('Slider POST error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
