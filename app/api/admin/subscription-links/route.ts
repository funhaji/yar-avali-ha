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
    
    const { keyExpiryDays, subscriptionDays, maxRedemptions } = await request.json()
    
    if (!keyExpiryDays || !subscriptionDays || !maxRedemptions) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      )
    }
    
    // Calculate expiry date from days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(keyExpiryDays))
    
    const link = await createSubscriptionLink(
      expiresAt,
      parseInt(maxRedemptions),
      userId,
      parseInt(subscriptionDays)
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
