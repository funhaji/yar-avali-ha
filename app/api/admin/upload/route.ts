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
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'توکن آپلود تنظیم نشده. BLOB_READ_WRITE_TOKEN را در تنظیمات محیطی اضافه کنید.' }, { status: 503 })
  }
  
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const blob = await put(`teachers/${Date.now()}-${sanitizedFilename}`, file, { 
    access: 'public', 
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN
  })
  return NextResponse.json({ url: blob.url })
}
