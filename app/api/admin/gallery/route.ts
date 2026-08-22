import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const images = await query(`SELECT * FROM yar_gallery ORDER BY created_at DESC`)
    return NextResponse.json({ images })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, image_url } = body
    
    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }
    
    const result = await query(
      `INSERT INTO yar_gallery (title, image_url) VALUES ($1, $2) RETURNING *`,
      [title || '', image_url]
    )
    
    return NextResponse.json({ success: true, image: result[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    await query(`DELETE FROM yar_gallery WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
