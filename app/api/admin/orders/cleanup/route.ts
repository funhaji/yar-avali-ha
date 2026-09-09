import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { cleanupExpiredOrders } from '@/lib/orders'

export async function POST() {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deletedCount = await cleanupExpiredOrders()

    return NextResponse.json({
      success: true,
      deletedCount
    })
  } catch (error: any) {
    console.error('Manual order cleanup error:', error)
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 })
  }
}
