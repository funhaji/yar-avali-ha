import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/teachers'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'فایلی انتخاب نشده است.' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'فقط تصویر مجاز است.' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'حجم تصویر باید کمتر از ۵ مگابایت باشد.' }, { status: 400 })
  const blob = await put(`teachers/${Date.now()}-${file.name}`, file, { access: 'public', addRandomSuffix: true })
  return NextResponse.json({ url: blob.url })
}
