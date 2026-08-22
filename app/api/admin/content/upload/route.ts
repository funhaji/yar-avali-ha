import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/teachers'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const kind = String(formData.get('kind') || '')
  if (!file) return NextResponse.json({ error: 'فایلی انتخاب نشده است.' }, { status: 400 })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')

  if (kind === 'thumbnail') {
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'برای تصویر شاخص فقط فایل تصویر مجاز است.' }, { status: 400 })
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'حجم تصویر باید کمتر از ۸ مگابایت باشد.' }, { status: 400 })
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'آپلود تصویر هنوز تنظیم نشده است. BLOB_READ_WRITE_TOKEN را تنظیم کنید یا لینک تصویر را دستی وارد کنید.' }, { status: 503 })
    }

    const blob = await put(`content/thumbnails/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return NextResponse.json({ url: blob.url })
  }

  if (kind === 'pdf') {
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'فقط فایل PDF مجاز است.' }, { status: 400 })
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'حجم PDF باید کمتر از ۵۰ مگابایت باشد.' }, { status: 400 })
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'آپلود PDF هنوز تنظیم نشده است. BLOB_READ_WRITE_TOKEN را تنظیم کنید.' }, { status: 503 })
    }

    const blob = await put(`content/pdfs/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return NextResponse.json({ url: blob.url, filename: file.name })
  }

  if (kind === 'store_file') {
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: 'حجم فایل باید کمتر از ۱۰۰ مگابایت باشد.' }, { status: 400 })
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'آپلود فایل تنظیم نشده است. BLOB_READ_WRITE_TOKEN را تنظیم کنید.' }, { status: 503 })
    }

    const blob = await put(`store/files/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return NextResponse.json({ url: blob.url, filename: file.name })
  }

  if (kind === 'video') {
    return NextResponse.json(
      { error: 'برای کم شدن مصرف Vercel، ویدیو را مستقیم در Pixeldrain آپلود کنید و لینک یا شناسه آن را در فرم وارد کنید.' },
      { status: 400 },
    )
  }

  return NextResponse.json({ error: 'نوع آپلود نامعتبر است.' }, { status: 400 })
}
