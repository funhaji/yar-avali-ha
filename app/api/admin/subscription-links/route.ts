import { NextRequest, NextResponse } from 'next/server'
import { createSubscriptionLink } from '@/lib/subscriptions'

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userId = request.headers.get('x-user-id')
    
    if (userRole !== 'admin' || !userId) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      )
    }
    
    const { expiresAt, maxRedemptions } = await request.json()
    
    if (!expiresAt || !maxRedemptions) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      )
    }
    
    const link = await createSubscriptionLink(
      new Date(expiresAt),
      parseInt(maxRedemptions),
      userId
    )
    
    return NextResponse.json({
      success: true,
      id: link.id,
      code: link.code
    })
    
  } catch (error: any) {
    console.error('Create subscription link error:', error)
    return NextResponse.json(
      { error: 'خطای سرور رخ داد' },
      { status: 500 }
    )
  }
}
