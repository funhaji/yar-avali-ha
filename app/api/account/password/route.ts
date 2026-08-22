import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { hashPassword, validatePassword, validateSession, verifyPassword } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user) return NextResponse.json({ error: 'ابتدا وارد حساب شوید.' }, { status: 401 })
  const { currentPassword, newPassword } = await request.json()
  const check = validatePassword(newPassword || '')
  if (!check.valid) return NextResponse.json({ error: check.error }, { status: 400 })
  const rows = await query<{ password_hash: string }>('SELECT password_hash FROM yar_users WHERE id = $1', [user.id])
  if (!rows[0] || !(await verifyPassword(currentPassword || '', rows[0].password_hash))) return NextResponse.json({ error: 'رمز فعلی درست نیست.' }, { status: 400 })
  const passwordHash = await hashPassword(newPassword)
  await query('UPDATE yar_users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, user.id])
  return NextResponse.json({ message: 'رمز عبور با موفقیت تغییر کرد.' })
}
