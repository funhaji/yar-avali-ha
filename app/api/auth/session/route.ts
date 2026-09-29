import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/auth/session - Get current user session
export async function GET(request: NextRequest) {
  try {
    const token = (await cookies()).get('session_token')?.value
    const user = token ? await validateSession(token) : null
    
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }

    if (!user) {
      const res = NextResponse.json({ user: null }, { headers })
      // If session is expired or invalid, remove stale is_logged_in cookie
      res.cookies.delete('is_logged_in')
      return res
    }
    
    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }
    }, { headers })

    // Ensure is_logged_in cookie is kept in sync
    res.cookies.set('is_logged_in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    return res
    
  } catch (error: any) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  }
}
