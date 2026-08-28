import { NextResponse } from 'next/server'; import { revalidateTag } from 'next/cache';
import { del } from '@vercel/blob'
import { query } from '@/lib/db'
import { getAllTeachers, requireAdmin } from '@/lib/teachers'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  return NextResponse.json({ teachers: await getAllTeachers() })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'عدم دسترسی' }, { status: 403 })
  const { name, specialty, bio, photo_url, display_order, is_visible, video_url, education, location, workplace, experience_years, national_rank, provincial_rank, district_rank, contact_phone, telegram_id, whatsapp_id, eitaa_id, instagram_id } = await request.json()
  if (!name) return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 })
  try {
    const rows = await query(
      'INSERT INTO yar_teachers (name, specialty, bio, photo_url, display_order, is_visible, video_url, education, location, workplace, experience_years, national_rank, provincial_rank, district_rank, contact_phone, telegram_id, whatsapp_id, eitaa_id, instagram_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *',
      [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, video_url || null, education || null, location || null, workplace || null, experience_years || null, national_rank || null, provincial_rank || null, district_rank || null, contact_phone || null, telegram_id || null, whatsapp_id || null, eitaa_id || null, instagram_id || null]
    )
    revalidateTag('teachers')
    return NextResponse.json({ teacher: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: 'خطا در دیتابیس: ' + e.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'عدم دسترسی' }, { status: 403 })
  const { id, name, specialty, bio, photo_url, display_order, is_visible, video_url, education, location, workplace, experience_years, national_rank, provincial_rank, district_rank, contact_phone, telegram_id, whatsapp_id, eitaa_id, instagram_id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ایدی الزامی است' }, { status: 400 })
  try {
    const rows = await query(
      'UPDATE yar_teachers SET name=$1, specialty=$2, bio=$3, photo_url=$4, display_order=$5, is_visible=$6, video_url=$7, education=$9, location=$10, workplace=$11, experience_years=$12, national_rank=$13, provincial_rank=$14, district_rank=$15, contact_phone=$16, telegram_id=$17, whatsapp_id=$18, eitaa_id=$19, instagram_id=$20, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, video_url || null, id, education || null, location || null, workplace || null, experience_years || null, national_rank || null, provincial_rank || null, district_rank || null, contact_phone || null, telegram_id || null, whatsapp_id || null, eitaa_id || null, instagram_id || null]
    )
    revalidateTag('teachers')
    return NextResponse.json({ teacher: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: 'خطا در دیتابیس: ' + e.message }, { status: 500 })
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
