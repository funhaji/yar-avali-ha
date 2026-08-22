import { NextRequest, NextResponse } from 'next/server'
import { createSubscriptionLink } from '@/lib/subscriptions'
import { requireAdmin } from '@/lib/teachers'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    
    if (!user) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز - لطفاً وارد شوید' },
        { status: 403 }
      )
    }
    
    const { expiresAt, maxRedemptions, subscriptionDays } = await request.json()
    
    if (!expiresAt || !maxRedemptions) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      )
    }
    
    const link = await createSubscriptionLink(
      new Date(expiresAt),
      parseInt(maxRedemptions),
      user.id,
      subscriptionDays ? parseInt(subscriptionDays) : 180
    )
    
    return NextResponse.json({
      success: true,
      id: link.id,
      code: link.code
    })
    
  } catch (error: any) {
    console.error('Create subscription link error:', error)
    return NextResponse.json(
      { error: 'خطای سرور رخ داد: ' + (error.message || 'نامشخص') },
      { status: 500 }
    )
  }
}
