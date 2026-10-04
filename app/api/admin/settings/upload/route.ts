import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/teachers'
import { optimizeImageBuffer } from '@/lib/image-optimizer'

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  
  if (!file) return NextResponse.json({ error: 'فایلی انتخاب نشده است.' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'فقط تصویر مجاز است.' }, { status: 400 })
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'حجم تصویر باید کمتر از ۱۵ مگابایت باشد.' }, { status: 400 })
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'توکن آپلود یافت نشد' }, { status: 503 })
  }
  
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const baseName = sanitizedFilename.replace(/\.[^/.]+$/, '')

  const arrayBuffer = await file.arrayBuffer()
  const optimized = await optimizeImageBuffer(Buffer.from(arrayBuffer), {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 82
  })

  const blob = await put(`posters/${Date.now()}-${baseName}.webp`, optimized.buffer, { 
    access: 'public', 
    contentType: 'image/webp',
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN
  })
  
  return NextResponse.json({ url: blob.url })
}
