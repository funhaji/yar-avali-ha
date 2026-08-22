import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { neon } from '@neondatabase/serverless'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/blog',
  '/workshops',
  '/teachers',
  '/subscription',
  '/shop',
  '/entertainment',
  '/worksheets',
  '/books',
  '/teacher-training',
  '/news'
]

// Public API routes that don't need authentication
const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/subscription/redeem',
  '/api/store',
  '/api/public-settings',
  '/api/comments'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') && !pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }
  
  // Allow public API routes without auth
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Allow public page routes without auth
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }
  
  // Get session token from cookie
  const token = request.cookies.get('session_token')?.value
  
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    // For page routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Validate session and get user info
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const sessions = await sql`
      SELECT s.user_id, u.name, u.email, u.role
      FROM yar_sessions s
      JOIN yar_users u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `
    
    if (sessions.length === 0) {
      // Invalid or expired session
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'جلسه منقضی شده است' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const user = sessions[0]
    
    // Create response with user headers
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.user_id)
    response.headers.set('x-user-name', user.name)
    response.headers.set('x-user-email', user.email)
    response.headers.set('x-user-role', user.role)
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
