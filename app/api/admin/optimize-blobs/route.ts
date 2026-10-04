import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'
import { optimizeImageBuffer } from '@/lib/image-optimizer'

export const maxDuration = 60 // Allow up to 60s for batch image processing

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN تنظیم نشده است.' }, { status: 503 })
  }

  const results: Array<{
    type: string
    id: string
    oldUrl: string
    newUrl: string
    oldSizeKB: number
    newSizeKB: number
    savedPercent: number
  }> = []

  let totalSavedBytes = 0

  try {
    // 1. Blog posts thumbnails
    const blogPosts = await query<any>('SELECT id, title, thumbnail_url FROM yar_blog_posts WHERE thumbnail_url LIKE \'%blob.vercel-storage.com%\'')
    for (const post of blogPosts) {
      if (!post.thumbnail_url || post.thumbnail_url.endsWith('.webp')) continue
      try {
        const res = await fetch(post.thumbnail_url)
        if (!res.ok) continue
        const arrayBuffer = await res.arrayBuffer()
        const inputBuf = Buffer.from(arrayBuffer)
        const optimized = await optimizeImageBuffer(inputBuf, { maxWidth: 1200, quality: 80 })
        
        if (optimized.optimizedSize < inputBuf.length) {
          const blob = await put(`content/thumbnails/opt-${Date.now()}-${post.id.slice(0, 8)}.webp`, optimized.buffer, {
            access: 'public',
            contentType: 'image/webp',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })

          await query('UPDATE yar_blog_posts SET thumbnail_url = $1 WHERE id = $2', [blob.url, post.id])
          try { await del(post.thumbnail_url, { token: process.env.BLOB_READ_WRITE_TOKEN }) } catch {}

          const saved = inputBuf.length - optimized.optimizedSize
          totalSavedBytes += saved
          results.push({
            type: 'blog',
            id: post.id,
            oldUrl: post.thumbnail_url,
            newUrl: blob.url,
            oldSizeKB: Math.round(inputBuf.length / 1024),
            newSizeKB: Math.round(optimized.optimizedSize / 1024),
            savedPercent: optimized.savedPercent
          })
        }
      } catch (err) {
        console.error(`Error optimizing blog ${post.id}:`, err)
      }
    }

    // 2. Store item thumbnails
    const storeItems = await query<any>('SELECT id, title, thumbnail_url FROM yar_store_items WHERE thumbnail_url LIKE \'%blob.vercel-storage.com%\'')
    for (const item of storeItems) {
      if (!item.thumbnail_url || item.thumbnail_url.endsWith('.webp')) continue
      try {
        const res = await fetch(item.thumbnail_url)
        if (!res.ok) continue
        const arrayBuffer = await res.arrayBuffer()
        const inputBuf = Buffer.from(arrayBuffer)
        const optimized = await optimizeImageBuffer(inputBuf, { maxWidth: 1000, quality: 80 })

        if (optimized.optimizedSize < inputBuf.length) {
          const blob = await put(`content/thumbnails/opt-store-${Date.now()}-${item.id.slice(0, 8)}.webp`, optimized.buffer, {
            access: 'public',
            contentType: 'image/webp',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })

          await query('UPDATE yar_store_items SET thumbnail_url = $1 WHERE id = $2', [blob.url, item.id])
          try { await del(item.thumbnail_url, { token: process.env.BLOB_READ_WRITE_TOKEN }) } catch {}

          const saved = inputBuf.length - optimized.optimizedSize
          totalSavedBytes += saved
          results.push({
            type: 'store',
            id: item.id,
            oldUrl: item.thumbnail_url,
            newUrl: blob.url,
            oldSizeKB: Math.round(inputBuf.length / 1024),
            newSizeKB: Math.round(optimized.optimizedSize / 1024),
            savedPercent: optimized.savedPercent
          })
        }
      } catch (err) {
        console.error(`Error optimizing store item ${item.id}:`, err)
      }
    }

    // 3. Teachers photos
    const teachers = await query<any>('SELECT id, name, photo FROM yar_teachers WHERE photo LIKE \'%blob.vercel-storage.com%\'')
    for (const teacher of teachers) {
      if (!teacher.photo || teacher.photo.endsWith('.webp')) continue
      try {
        const res = await fetch(teacher.photo)
        if (!res.ok) continue
        const arrayBuffer = await res.arrayBuffer()
        const inputBuf = Buffer.from(arrayBuffer)
        const optimized = await optimizeImageBuffer(inputBuf, { maxWidth: 800, maxHeight: 800, quality: 82 })

        if (optimized.optimizedSize < inputBuf.length) {
          const blob = await put(`teachers/opt-${Date.now()}-${teacher.id.slice(0, 8)}.webp`, optimized.buffer, {
            access: 'public',
            contentType: 'image/webp',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })

          await query('UPDATE yar_teachers SET photo = $1 WHERE id = $2', [blob.url, teacher.id])
          try { await del(teacher.photo, { token: process.env.BLOB_READ_WRITE_TOKEN }) } catch {}

          const saved = inputBuf.length - optimized.optimizedSize
          totalSavedBytes += saved
          results.push({
            type: 'teacher',
            id: teacher.id,
            oldUrl: teacher.photo,
            newUrl: blob.url,
            oldSizeKB: Math.round(inputBuf.length / 1024),
            newSizeKB: Math.round(optimized.optimizedSize / 1024),
            savedPercent: optimized.savedPercent
          })
        }
      } catch (err) {
        console.error(`Error optimizing teacher ${teacher.id}:`, err)
      }
    }

    // 4. Homepage slides
    try {
      const slides = await query<any>('SELECT id, image_url FROM yar_homepage_slides WHERE image_url LIKE \'%blob.vercel-storage.com%\'')
      for (const slide of slides) {
        if (!slide.image_url || slide.image_url.endsWith('.webp')) continue
        try {
          const res = await fetch(slide.image_url)
          if (!res.ok) continue
          const arrayBuffer = await res.arrayBuffer()
          const inputBuf = Buffer.from(arrayBuffer)
          const optimized = await optimizeImageBuffer(inputBuf, { maxWidth: 1920, maxHeight: 1080, quality: 82 })

          if (optimized.optimizedSize < inputBuf.length) {
            const blob = await put(`posters/opt-${Date.now()}-${slide.id.slice(0, 8)}.webp`, optimized.buffer, {
              access: 'public',
              contentType: 'image/webp',
              addRandomSuffix: true,
              token: process.env.BLOB_READ_WRITE_TOKEN,
            })

            await query('UPDATE yar_homepage_slides SET image_url = $1 WHERE id = $2', [blob.url, slide.id])
            try { await del(slide.image_url, { token: process.env.BLOB_READ_WRITE_TOKEN }) } catch {}

            const saved = inputBuf.length - optimized.optimizedSize
            totalSavedBytes += saved
            results.push({
              type: 'slide',
              id: slide.id,
              oldUrl: slide.image_url,
              newUrl: blob.url,
              oldSizeKB: Math.round(inputBuf.length / 1024),
              newSizeKB: Math.round(optimized.optimizedSize / 1024),
              savedPercent: optimized.savedPercent
            })
          }
        } catch (err) {
          console.error(`Error optimizing slide ${slide.id}:`, err)
        }
      }
    } catch {}

    // 5. Gallery images
    try {
      const gallery = await query<any>('SELECT id, image_url FROM yar_gallery WHERE image_url LIKE \'%blob.vercel-storage.com%\'')
      for (const item of gallery) {
        if (!item.image_url || item.image_url.endsWith('.webp')) continue
        try {
          const res = await fetch(item.image_url)
          if (!res.ok) continue
          const arrayBuffer = await res.arrayBuffer()
          const inputBuf = Buffer.from(arrayBuffer)
          const optimized = await optimizeImageBuffer(inputBuf, { maxWidth: 1600, quality: 82 })

          if (optimized.optimizedSize < inputBuf.length) {
            const blob = await put(`gallery/images/opt-${Date.now()}-${item.id.slice(0, 8)}.webp`, optimized.buffer, {
              access: 'public',
              contentType: 'image/webp',
              addRandomSuffix: true,
              token: process.env.BLOB_READ_WRITE_TOKEN,
            })

            await query('UPDATE yar_gallery SET image_url = $1 WHERE id = $2', [blob.url, item.id])
            try { await del(item.image_url, { token: process.env.BLOB_READ_WRITE_TOKEN }) } catch {}

            const saved = inputBuf.length - optimized.optimizedSize
            totalSavedBytes += saved
            results.push({
              type: 'gallery',
              id: item.id,
              oldUrl: item.image_url,
              newUrl: blob.url,
              oldSizeKB: Math.round(inputBuf.length / 1024),
              newSizeKB: Math.round(optimized.optimizedSize / 1024),
              savedPercent: optimized.savedPercent
            })
          }
        } catch (err) {
          console.error(`Error optimizing gallery item ${item.id}:`, err)
        }
      }
    } catch {}

    const totalSavedMB = (totalSavedBytes / (1024 * 1024)).toFixed(2)

    return NextResponse.json({
      success: true,
      optimizedCount: results.length,
      totalSavedMB,
      totalSavedBytes,
      message: `تعداد ${results.length} تصویر با موفقیت به فرمت سبک WebP تبدیل شد و ${totalSavedMB} مگابایت در ترافیک صرفه‌جویی گردید.`,
      results
    })
  } catch (error: any) {
    console.error('Batch blob optimization error:', error)
    return NextResponse.json({ error: error.message || 'خطا در بهینه‌سازی تصاویر' }, { status: 500 })
  }
}
