import { cookies } from 'next/headers'
import { query } from './db'
import { validateSession } from './auth'

export interface Teacher {
  id: string
  name: string
  specialty: string | null
  bio: string | null
  photo_url: string | null
  display_order: number
  is_visible: boolean
}

export async function getVisibleTeachers(): Promise<Teacher[]> {
  return query<Teacher>('SELECT * FROM yar_teachers WHERE is_visible = true ORDER BY display_order ASC, created_at ASC')
}

export async function getAllTeachers(): Promise<Teacher[]> {
  return query<Teacher>('SELECT * FROM yar_teachers ORDER BY display_order ASC, created_at ASC')
}

export async function requireAdmin() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user || user.role !== 'admin') return null
  return user
}
