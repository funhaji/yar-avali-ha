import { NextRequest, NextResponse } from 'next/server'
import { redeemSubscriptionLink } from '@/lib/subscriptions'

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json()
    
    if (!code || !userId) {
      return NextResponse.json(
        { error: 'کد و شناسه کاربر الزامی است' },
        { status: 400 }
      )
    }
    
    const result = await redeemSubscriptionLink(code, userId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
      subscription: result.subscription
    })
    
  } catch (error: any) {
    console.error('Redeem error:', error)
    return NextResponse.json(
      { error: 'خطای سرور رخ داد' },
      { status: 500 }
    )
  }
}
