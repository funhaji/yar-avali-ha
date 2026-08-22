import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await query(`
      SELECT * FROM yar_blog_posts WHERE id = $1
    `, [id])

    if (result.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: result[0] })
  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, slug, content, excerpt, thumbnail_url, images, video_url, video_provider, redirect_url, published, category } = await request.json()

    const result = await query(`
      UPDATE yar_blog_posts
      SET title = $1, slug = $2, content = $3, excerpt = $4, 
          thumbnail_url = $5, images = $6, video_url = $7, video_provider = $8, redirect_url = $9, published = $10, category = $12, updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [title, slug, content, excerpt, thumbnail_url, images || [], video_url || null, video_provider || 'direct', redirect_url || null, published, id, category || null])

    if (result.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    revalidateTag('blog')
    return NextResponse.json({ post: result[0] })
  } catch (error) {
    console.error('Update blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { published } = await request.json()

    const result = await query(`
      UPDATE yar_blog_posts
      SET published = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [published, id])

    if (result.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    revalidateTag('blog')
    return NextResponse.json({ post: result[0] })
  } catch (error) {
    console.error('Toggle blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query(`DELETE FROM yar_blog_posts WHERE id = $1`, [id])

    revalidateTag('blog')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
