import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'

// GET /api/auth/session - Get current user session
export async function GET(request: NextRequest) {
  try {
    const token = (await cookies()).get('session_token')?.value
    const user = token ? await validateSession(token) : null
    
    if (!user) {
      return NextResponse.json({ user: null })
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error: any) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}
