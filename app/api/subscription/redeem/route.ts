import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { redeemSubscriptionLink } from '@/lib/subscriptions'

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const token = (await cookies()).get('session_token')?.value
    const user = token ? await validateSession(token) : null
    
    if (!user) {
      return NextResponse.json(
        { error: 'لطفاً ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }
    
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'کد اشتراک الزامی است' },
        { status: 400 }
      )
    }
    
    const result = await redeemSubscriptionLink(code, user.id)
    
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
