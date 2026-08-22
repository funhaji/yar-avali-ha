import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { validateSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'هیچ فایلی انتخاب نشده است.' }, { status: 400 })

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'فقط آپلود تصویر مجاز است.' }, { status: 400 })
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم تصویر نباید بیشتر از 5 مگابایت باشد.' }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'توکن آپلود تنظیم نشده است.' }, { status: 503 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const blob = await put(`store/receipts/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Receipt upload error:', error)
    return NextResponse.json({ error: 'خطای سرور در آپلود فایل' }, { status: 500 })
  }
}
