import { NextResponse } from 'next/server'; import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { updateStoreItem, deleteStoreItem } from '@/lib/store'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const item = await updateStoreItem(id, body)
    revalidateTag('store')
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Admin Store API PUT Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await deleteStoreItem(id)
    revalidateTag('store')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin Store API DELETE Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
