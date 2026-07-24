import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/teachers'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'آپلود مستقیم در این میزبان پیکربندی نشده است. نشانی تصویر را وارد کنید یا BLOB_READ_WRITE_TOKEN را تنظیم کنید.' },
      { status: 503 },
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'فایلی انتخاب نشده است.' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'فقط تصویر مجاز است.' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'حجم تصویر باید کمتر از ۵ مگابایت باشد.' }, { status: 400 })

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const blob = await put(`teachers/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json({ error: 'آپلود تصویر انجام نشد. تنظیمات Blob این میزبان را بررسی کنید.' }, { status: 502 })
  }
}
