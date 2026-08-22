import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getAllContentItems, normalizeContentInput, validateContentInput } from '@/lib/content'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/teachers'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  return NextResponse.json({ items: await getAllContentItems() })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })

  const content = normalizeContentInput(await request.json())
  const error = validateContentInput(content)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const rows = await query(
    `INSERT INTO yar_content_items (
      title, title_en, description, content_type, tier_requirement, age_tag, grade_level,
      category, genre, series_title, episode_number, duration_seconds, video_url,
      pixeldrain_id, thumbnail_url, file_size_bytes, published, storage_provider, r2_key, gdrive_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
    RETURNING *`,
    [
      content.title, content.title_en, content.description, content.content_type, content.tier_requirement,
      content.age_tag, content.grade_level, content.category, content.genre, content.series_title,
      content.episode_number, content.duration_seconds, content.video_url, content.pixeldrain_id,
      content.thumbnail_url, content.file_size_bytes, content.published,
      content.storage_provider || 'pixeldrain', content.r2_key || null, content.gdrive_id || null,
    ],
  )

  revalidateTag('content')
  return NextResponse.json({ item: rows[0], message: 'محتوا اضافه شد.' })
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })

  const body = await request.json()
  const id = String(body.id || '')
  if (!id) return NextResponse.json({ error: 'شناسه محتوا لازم است.' }, { status: 400 })

  const content = normalizeContentInput(body)
  const error = validateContentInput(content)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const rows = await query(
    `UPDATE yar_content_items SET
      title=$1, title_en=$2, description=$3, content_type=$4, tier_requirement=$5,
      age_tag=$6, grade_level=$7, category=$8, genre=$9, series_title=$10,
      episode_number=$11, duration_seconds=$12, video_url=$13, pixeldrain_id=$14,
      thumbnail_url=$15, file_size_bytes=$16, published=$17, storage_provider=$18,
      r2_key=$19, gdrive_id=$20, updated_at=NOW()
    WHERE id=$21
    RETURNING *`,
    [
      content.title, content.title_en, content.description, content.content_type, content.tier_requirement,
      content.age_tag, content.grade_level, content.category, content.genre, content.series_title,
      content.episode_number, content.duration_seconds, content.video_url, content.pixeldrain_id,
      content.thumbnail_url, content.file_size_bytes, content.published,
      content.storage_provider || 'pixeldrain', content.r2_key || null, content.gdrive_id || null, id,
    ],
  )

  if (!rows[0]) return NextResponse.json({ error: 'محتوا پیدا نشد.' }, { status: 404 })
  revalidateTag('content')
  return NextResponse.json({ item: rows[0], message: 'محتوا ذخیره شد.' })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const { id, published } = await request.json()
  if (!id) return NextResponse.json({ error: 'شناسه محتوا لازم است.' }, { status: 400 })
  const rows = await query('UPDATE yar_content_items SET published=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [Boolean(published), id])
  if (!rows[0]) return NextResponse.json({ error: 'محتوا پیدا نشد.' }, { status: 404 })
  revalidateTag('content'); return NextResponse.json({ item: rows[0] })
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'شناسه محتوا لازم است.' }, { status: 400 })
  await query('DELETE FROM yar_content_items WHERE id=$1', [id])
  revalidateTag('content'); return NextResponse.json({ success: true })
}
