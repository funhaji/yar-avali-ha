import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'
import { optimizeImageBuffer } from '@/lib/image-optimizer'

export const maxDuration = 60

type QueueItem = {
  table: string
  id: string
  column: string
  url: string
  maxWidth: number
  maxHeight?: number
  quality: number
  prefix: string
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN تنظیم نشده است.' }, { status: 503 })
  }

  try {
    const queue: QueueItem[] = []

    // 1. Blog posts
    try {
      const blogs = await query<any>(`SELECT id, thumbnail_url FROM yar_blog_posts WHERE thumbnail_url LIKE '%blob.vercel-storage.com%'`)
      for (const b of blogs) {
        if (b.thumbnail_url && !b.thumbnail_url.endsWith('.webp')) {
          queue.push({
            table: 'yar_blog_posts',
            id: b.id,
            column: 'thumbnail_url',
            url: b.thumbnail_url,
            maxWidth: 1200,
            quality: 80,
            prefix: 'content/thumbnails'
          })
        }
      }
    } catch (e: any) {
      console.warn('Error reading blog posts:', e.message)
    }

    // 2. Store items
    try {
      const store = await query<any>(`SELECT id, thumbnail_url FROM yar_store_items WHERE thumbnail_url LIKE '%blob.vercel-storage.com%'`)
      for (const s of store) {
        if (s.thumbnail_url && !s.thumbnail_url.endsWith('.webp')) {
          queue.push({
            table: 'yar_store_items',
            id: s.id,
            column: 'thumbnail_url',
            url: s.thumbnail_url,
            maxWidth: 1000,
            quality: 80,
            prefix: 'content/thumbnails'
          })
        }
      }
    } catch (e: any) {
      console.warn('Error reading store items:', e.message)
    }

    // 3. Teachers (using photo_url column)
    try {
      const teachers = await query<any>(`SELECT id, photo_url FROM yar_teachers WHERE photo_url LIKE '%blob.vercel-storage.com%'`)
      for (const t of teachers) {
        if (t.photo_url && !t.photo_url.endsWith('.webp')) {
          queue.push({
            table: 'yar_teachers',
            id: t.id,
            column: 'photo_url',
            url: t.photo_url,
            maxWidth: 800,
            maxHeight: 800,
            quality: 82,
            prefix: 'teachers'
          })
        }
      }
    } catch (e: any) {
      console.warn('Error reading teachers:', e.message)
    }

    // 4. Homepage slides
    try {
      const slides = await query<any>(`SELECT id, image_url FROM yar_homepage_slides WHERE image_url LIKE '%blob.vercel-storage.com%'`)
      for (const s of slides) {
        if (s.image_url && !s.image_url.endsWith('.webp')) {
          queue.push({
            table: 'yar_homepage_slides',
            id: s.id,
            column: 'image_url',
            url: s.image_url,
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 82,
            prefix: 'posters'
          })
        }
      }
    } catch (e: any) {
      console.warn('Error reading slides:', e.message)
    }

    // 5. Gallery
    try {
      const gallery = await query<any>(`SELECT id, image_url FROM yar_gallery WHERE image_url LIKE '%blob.vercel-storage.com%'`)
      for (const g of gallery) {
        if (g.image_url && !g.image_url.endsWith('.webp')) {
          queue.push({
            table: 'yar_gallery',
            id: g.id,
            column: 'image_url',
            url: g.image_url,
            maxWidth: 1600,
            quality: 82,
            prefix: 'gallery/images'
          })
        }
      }
    } catch (e: any) {
      console.warn('Error reading gallery:', e.message)
    }

    // 6. Content items
    try {
      const contents = await query<any>(`SELECT id, thumbnail_url FROM yar_content_items WHERE thumbnail_url LIKE '%blob.vercel-storage.com%'`)
      for (const c of contents) {
        if (c.thumbnail_url && !c.thumbnail_url.endsWith('.webp')) {
          queue.push({
            table: 'yar_content_items',
            id: c.id,
            column: 'thumbnail_url',
            url: c.thumbnail_url,
            maxWidth: 1000,
            quality: 80,
            prefix: 'content/thumbnails'
          })
        }
      }
    } catch (e: any) {
      console.warn('Error reading content items:', e.message)
    }

    const totalPending = queue.length
    if (totalPending === 0) {
      return NextResponse.json({
        success: true,
        optimizedCount: 0,
        remainingCount: 0,
        totalSavedMB: '0',
        message: 'همه تصاویر قبلاً به فرمت WebP بهینه‌سازی شده‌اند و نیازی به بهینه‌سازی مجدد نیست.'
      })
    }

    // Process a batch of up to 6 items per request to stay well within serverless timeouts
    const BATCH_SIZE = 6
    const batch = queue.slice(0, BATCH_SIZE)

    let totalSavedBytes = 0
    const processed: any[] = []

    await Promise.all(
      batch.map(async (item) => {
        try {
          const res = await fetch(item.url)
          if (!res.ok) return
          const arrayBuffer = await res.arrayBuffer()
          const inputBuf = Buffer.from(arrayBuffer)
          const optimized = await optimizeImageBuffer(inputBuf, {
            maxWidth: item.maxWidth,
            maxHeight: item.maxHeight,
            quality: item.quality
          })

          const shortId = item.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
          const blob = await put(`${item.prefix}/opt-${Date.now()}-${shortId}.webp`, optimized.buffer, {
            access: 'public',
            contentType: 'image/webp',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })

          // Safe parameterized update
          await query(`UPDATE ${item.table} SET ${item.column} = $1 WHERE id = $2`, [blob.url, item.id])

          // Clean up old bloated file
          try {
            await del(item.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
          } catch {}

          const saved = Math.max(0, inputBuf.length - optimized.optimizedSize)
          totalSavedBytes += saved
          processed.push({
            table: item.table,
            id: item.id,
            savedKB: Math.round(saved / 1024),
            newUrl: blob.url
          })
        } catch (err: any) {
          console.error(`Failed to optimize ${item.table}:${item.id}:`, err.message)
        }
      })
    )

    const remainingCount = totalPending - processed.length
    const totalSavedMB = (totalSavedBytes / (1024 * 1024)).toFixed(2)

    return NextResponse.json({
      success: true,
      optimizedCount: processed.length,
      remainingCount,
      hasMore: remainingCount > 0,
      totalSavedMB,
      message: remainingCount > 0 
        ? `${processed.length} تصویر با موفقیت فشرده شد (${remainingCount} تصویر باقی مانده است).`
        : `همه ${processed.length} تصویر با موفقیت به WebP تبدیل شدند و ${totalSavedMB} مگابایت ترافیک صرفه‌جویی شد.`
    })
  } catch (error: any) {
    console.error('Batch blob optimization error:', error)
    return NextResponse.json({ error: error.message || 'خطا در بهینه‌سازی تصاویر' }, { status: 500 })
  }
}
