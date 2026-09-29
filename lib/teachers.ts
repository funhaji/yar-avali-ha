import { cookies } from 'next/headers'
import { query } from './db'
import { validateSession } from './auth'

export interface PricingOption {
  duration_minutes: number
  price_toman: number
}

export interface AvailabilitySchedule {
  days?: string[]
  hours?: string
  notes?: string
}

export interface Teacher {
  id: string
  name: string
  specialty: string | null
  bio: string | null
  photo_url: string | null
  video_url?: string | null
  display_order: number
  is_visible: boolean
  education?: string | null
  location?: string | null
  workplace?: string | null
  experience_years?: number | null
  national_rank?: number | null
  provincial_rank?: number | null
  district_rank?: number | null
  contact_phone?: string | null
  telegram_id?: string | null
  whatsapp_id?: string | null
  eitaa_id?: string | null
  instagram_id?: string | null
  
  // Tutoring extensions
  teaching_modes?: string[] | null
  badge_text?: string | null
  star_rating?: number | null
  review_count?: number | null
  successful_sessions?: number | null
  highlights?: string[] | null
  pricing_options?: PricingOption[] | null
  availability_schedule?: AvailabilitySchedule | null
  grades?: string[] | null
  subjects?: string[] | null
  cities?: string[] | null
}

export interface TutoringGrade {
  id: string
  name: string
  display_order: number
  is_active: boolean
  created_at: Date
}

export interface TutoringSubject {
  id: string
  name: string
  grade_id?: string | null
  grade_name?: string | null
  display_order: number
  is_active: boolean
  created_at: Date
}

export interface TutoringRequest {
  id: string
  teacher_id: string
  teacher_name?: string
  teacher_photo?: string | null
  user_id?: string | null
  student_name: string
  phone: string
  teaching_mode: string
  grade?: string | null
  subject?: string | null
  duration_minutes?: number | null
  preferred_time?: string | null
  city?: string | null
  notes?: string | null
  status: string
  created_at: Date
}

export function normalizeTeacher(t: any): Teacher {
  if (!t) return t
  let pricing = t.pricing_options
  if (typeof pricing === 'string') {
    try { pricing = JSON.parse(pricing) } catch { pricing = [] }
  }
  let schedule = t.availability_schedule
  if (typeof schedule === 'string') {
    try { schedule = JSON.parse(schedule) } catch { schedule = {} }
  }
  let modes = t.teaching_modes
  if (typeof modes === 'string') {
    try { modes = JSON.parse(modes) } catch { modes = ['online', 'in_person'] }
  }
  let highlights = t.highlights
  if (typeof highlights === 'string') {
    try { highlights = JSON.parse(highlights) } catch { highlights = highlights.split('\n').filter(Boolean) }
  }
  let grades = t.grades
  if (typeof grades === 'string') {
    try { grades = JSON.parse(grades) } catch { grades = grades.split(',').map((s: string) => s.trim()).filter(Boolean) }
  }
  let subjects = t.subjects
  if (typeof subjects === 'string') {
    try { subjects = JSON.parse(subjects) } catch { subjects = subjects.split(',').map((s: string) => s.trim()).filter(Boolean) }
  }
  let cities = t.cities
  if (typeof cities === 'string') {
    try { cities = JSON.parse(cities) } catch { cities = cities.split(',').map((s: string) => s.trim()).filter(Boolean) }
  }

  return {
    ...t,
    teaching_modes: Array.isArray(modes) && modes.length > 0 ? modes : ['online', 'in_person'],
    highlights: Array.isArray(highlights) ? highlights : [],
    grades: Array.isArray(grades) ? grades : [],
    subjects: Array.isArray(subjects) ? subjects : [],
    cities: Array.isArray(cities) ? cities : [],
    pricing_options: Array.isArray(pricing) ? pricing : [],
    availability_schedule: schedule && typeof schedule === 'object' ? schedule : {},
    star_rating: t.star_rating !== null && t.star_rating !== undefined ? Number(t.star_rating) : 5.0,
    review_count: t.review_count ? Number(t.review_count) : 0,
    successful_sessions: t.successful_sessions ? Number(t.successful_sessions) : 0,
  }
}

export async function getVisibleTeachers(): Promise<Teacher[]> {
  const rows = await query<Teacher>('SELECT * FROM yar_teachers WHERE is_visible = true ORDER BY display_order ASC, created_at DESC')
  return rows.map(normalizeTeacher)
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const rows = await query<Teacher>('SELECT * FROM yar_teachers ORDER BY display_order ASC, created_at DESC')
  return rows.map(normalizeTeacher)
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const results = await query<Teacher>('SELECT * FROM yar_teachers WHERE id = $1', [id])
  return results[0] ? normalizeTeacher(results[0]) : null
}

// Grades
export async function getActiveTutoringGrades(): Promise<TutoringGrade[]> {
  return query<TutoringGrade>('SELECT * FROM yar_tutoring_grades WHERE is_active = true ORDER BY display_order ASC, name ASC')
}

export async function getAllTutoringGrades(): Promise<TutoringGrade[]> {
  return query<TutoringGrade>('SELECT * FROM yar_tutoring_grades ORDER BY display_order ASC, name ASC')
}

// Subjects
export async function getActiveTutoringSubjects(): Promise<TutoringSubject[]> {
  return query<TutoringSubject>(`
    SELECT s.*, g.name as grade_name 
    FROM yar_tutoring_subjects s
    LEFT JOIN yar_tutoring_grades g ON s.grade_id = g.id
    WHERE s.is_active = true 
    ORDER BY s.display_order ASC, s.name ASC
  `)
}

export async function getAllTutoringSubjects(): Promise<TutoringSubject[]> {
  return query<TutoringSubject>(`
    SELECT s.*, g.name as grade_name 
    FROM yar_tutoring_subjects s
    LEFT JOIN yar_tutoring_grades g ON s.grade_id = g.id
    ORDER BY s.display_order ASC, s.name ASC
  `)
}

// Tutoring Requests
export async function getTutoringRequests(status?: string): Promise<TutoringRequest[]> {
  if (status && status !== 'all') {
    return query<TutoringRequest>(`
      SELECT r.*, t.name as teacher_name, t.photo_url as teacher_photo
      FROM yar_tutoring_requests r
      LEFT JOIN yar_teachers t ON r.teacher_id = t.id
      WHERE r.status = $1
      ORDER BY r.created_at DESC
    `, [status])
  }
  return query<TutoringRequest>(`
    SELECT r.*, t.name as teacher_name, t.photo_url as teacher_photo
    FROM yar_tutoring_requests r
    LEFT JOIN yar_teachers t ON r.teacher_id = t.id
    ORDER BY r.created_at DESC
  `)
}

export async function requireAdmin() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user || user.role !== 'admin') return null
  return user
}
