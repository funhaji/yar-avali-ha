import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, verifyPassword, createSession, deleteSession, validateEmail, validatePassword, User } from '@/lib/auth'

// POST /api/auth - Handle login, register, logout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name, phone } = body
    
    // REGISTER
    if (action === 'register') {
      // Validate email
      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'فرمت ایمیل نامعتبر است' },
          { status: 400 }
        )
      }
      
      // Validate password
      const passwordCheck = validatePassword(password)
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { error: passwordCheck.error },
          { status: 400 }
        )
      }
      
      // Check if user exists
      const existing = await query<User>(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )
      
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'این ایمیل قبلاً ثبت شده است' },
          { status: 400 }
        )
      }
      
      // Hash password and create user
      const passwordHash = await hashPassword(password)
      const result = await query<{ id: string }>(
        'INSERT INTO users (email, password_hash, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [email, passwordHash, name, phone || null, 'user']
      )
      
      const userId = result[0].id
      const token = await createSession(userId)
      
      const response = NextResponse.json({ 
        success: true, 
        userId,
        message: 'ثبت‌نام با موفقیت انجام شد'
      })
      
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      
      return response
    }
    
    // LOGIN
    if (action === 'login') {
      const users = await query<User>(
        'SELECT id, password_hash, role FROM users WHERE email = $1',
        [email]
      )
      
      if (users.length === 0) {
        return NextResponse.json(
          { error: 'ایمیل یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }
      
      const user = users[0]
      const valid = await verifyPassword(password, user.password_hash)
      
      if (!valid) {
        return NextResponse.json(
          { error: 'ایمیل یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }
      
      const token = await createSession(user.id)
      
      const response = NextResponse.json({ 
        success: true, 
        userId: user.id,
        role: user.role,
        message: 'ورود با موفقیت انجام شد'
      })
      
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      
      return response
    }
    
    // LOGOUT
    if (action === 'logout') {
      const token = request.cookies.get('session_token')?.value
      if (token) {
        await deleteSession(token)
      }
      
      const response = NextResponse.json({ 
        success: true,
        message: 'خروج با موفقیت انجام شد'
      })
      
      response.cookies.delete('session_token')
      return response
    }
    
    return NextResponse.json(
      { error: 'عملیات نامعتبر است' },
      { status: 400 }
    )
    
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'خطای سرور رخ داد' },
      { status: 500 }
    )
  }
}
