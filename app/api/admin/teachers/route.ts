import { NextResponse } from 'next/server'; import { revalidateTag } from 'next/cache';
import { del } from '@vercel/blob'
import { query } from '@/lib/db'
import { getAllTeachers, requireAdmin } from '@/lib/teachers'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  return NextResponse.json({ teachers: await getAllTeachers() })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const { name, specialty, bio, photo_url, display_order, is_visible, video_url } = await request.json()
  if (!name) return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 })
  try {
    const rows = await query(
      'INSERT INTO yar_teachers (name, specialty, bio, photo_url, display_order, is_visible, video_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, video_url || null]
    )
    revalidateTag('teachers')
    return NextResponse.json({ teacher: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: 'خطای دیتابیس: ' + e.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const { id, name, specialty, bio, photo_url, display_order, is_visible, video_url } = await request.json()
  if (!id) return NextResponse.json({ error: 'ایدی الزامی است' }, { status: 400 })
  try {
    const rows = await query(
      'UPDATE yar_teachers SET name=$1, specialty=$2, bio=$3, photo_url=$4, display_order=$5, is_visible=$6, video_url=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, video_url || null, id]
    )
    revalidateTag('teachers')
    return NextResponse.json({ teacher: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: 'خطای دیتابیس: ' + e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const { id } = await request.json()
  const rows = await query<{ photo_url: string | null }>('DELETE FROM yar_teachers WHERE id=$1 RETURNING photo_url', [id])
  const photo = rows[0]?.photo_url
  if (photo && photo.includes('blob.vercel-storage.com')) {
    try { await del(photo) } catch { /* ignore missing blob */ }
  }
  revalidateTag('teachers'); return NextResponse.json({ success: true })
}
