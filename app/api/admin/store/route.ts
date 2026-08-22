import { NextResponse } from 'next/server'; import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getStoreItems, createStoreItem } from '@/lib/store'

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const items = await getStoreItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Admin Store API GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const item = await createStoreItem(body)
    revalidateTag('store')
    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Admin Store API POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
