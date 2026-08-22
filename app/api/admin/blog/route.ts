import { NextResponse } from 'next/server'; import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, slug, content, excerpt, thumbnail_url, images, video_url, video_provider, redirect_url, published } = await request.json()

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    const result = await query(`
      INSERT INTO yar_blog_posts (title, slug, content, excerpt, thumbnail_url, images, video_url, video_provider, redirect_url, published, author_id, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [title, slug, content, excerpt, thumbnail_url, images || [], video_url || null, video_provider || 'direct', redirect_url || null, published, user.id, body.category || null])

    revalidateTag('blog')
    return NextResponse.json({ post: result[0] })
  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
