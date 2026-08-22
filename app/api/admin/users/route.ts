import { NextResponse } from 'next/server'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/teachers'

type AdminUserRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  active_subscription_until: string | null
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })

  const users = await query<AdminUserRow>(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.role,
      u.created_at,
      MAX(s.end_date) FILTER (WHERE s.end_date > NOW()) AS active_subscription_until
    FROM yar_users u
    LEFT JOIN yar_subscriptions s ON s.user_id = u.id
    GROUP BY u.id
    ORDER BY
      CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END,
      u.created_at DESC
  `)

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })

  const { name, email, phone, password } = await request.json()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!name || !validateEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'نام و ایمیل معتبر لازم است.' }, { status: 400 })
  }

  const passwordCheck = validatePassword(password || '')
  if (!passwordCheck.valid) return NextResponse.json({ error: passwordCheck.error }, { status: 400 })

  const existing = await query<{ id: string }>('SELECT id FROM yar_users WHERE email = $1', [normalizedEmail])
  if (existing.length > 0) {
    return NextResponse.json({ error: 'این ایمیل قبلاً ثبت شده است.' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  const rows = await query<AdminUserRow>(
    `INSERT INTO yar_users (email, password_hash, name, phone, role)
     VALUES ($1, $2, $3, $4, 'admin')
     RETURNING id, name, email, phone, role, created_at, NULL AS active_subscription_until`,
    [normalizedEmail, passwordHash, name, phone || null]
  )

  return NextResponse.json({ user: rows[0], message: 'ادمین جدید ساخته شد.' })
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })

  const { id, action } = await request.json()
  if (!id) return NextResponse.json({ error: 'شناسه کاربر لازم است.' }, { status: 400 })

  const newRole = action === 'demote' ? 'user' : 'admin'
  const message = action === 'demote' ? 'نقش ادمین حذف شد.' : 'کاربر ادمین شد.'

  const rows = await query<AdminUserRow>(
    `UPDATE yar_users
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, phone, role, created_at, NULL AS active_subscription_until`,
    [newRole, id]
  )

  if (!rows[0]) return NextResponse.json({ error: 'کاربر پیدا نشد.' }, { status: 404 })
  return NextResponse.json({ user: rows[0], message })
}
