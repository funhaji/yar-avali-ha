import { cookies } from 'next/headers'
import { query } from './db'
import { validateSession } from './auth'

export type TeachingScope = 'students' | 'teachers' | 'both'
export type ReviewerRole = 'parent' | 'teacher'

export interface PricingOption {
  duration_minutes: number
  price_toman: number
  title?: string
  description?: string
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

  // Teacher training extensions (for teaching teachers)
  teaching_scope?: TeachingScope | null
  training_topics?: string[] | null
  training_target_levels?: string[] | null
  training_bio?: string | null
  training_certificate?: string | null
  training_video_url?: string | null
  training_pricing_options?: PricingOption[] | null
}

export interface TutoringGrade {
  id: string
  name: string
  category?: string | null
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
  teaching_type?: 'student' | 'teacher_training' | null
  grade?: string | null
  subject?: string | null
  duration_minutes?: number | null
  preferred_time?: string | null
  city?: string | null
  notes?: string | null
  status: string
  created_at: Date
}

export interface TeacherReview {
  id: string
  teacher_id: string
  teacher_name?: string
  teacher_photo?: string | null
  user_id?: string | null
  reviewer_name: string
  reviewer_role: ReviewerRole
  rating: number
  subject_or_topic?: string | null
  comment: string
  is_approved: boolean
  created_at: Date
}

export function normalizeTeacher(t: any): Teacher {
  if (!t) return t
  let pricing = t.pricing_options
  if (typeof pricing === 'string') {
    try { pricing = JSON.parse(pricing) } catch { pricing = [] }
  }
  let trainingPricing = t.training_pricing_options
  if (typeof trainingPricing === 'string') {
    try { trainingPricing = JSON.parse(trainingPricing) } catch { trainingPricing = [] }
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
  let trainingTopics = t.training_topics
  if (typeof trainingTopics === 'string') {
    try { trainingTopics = JSON.parse(trainingTopics) } catch { trainingTopics = trainingTopics.split(',').map((s: string) => s.trim()).filter(Boolean) }
  }
  let targetLevels = t.training_target_levels
  if (typeof targetLevels === 'string') {
    try { targetLevels = JSON.parse(targetLevels) } catch { targetLevels = targetLevels.split(',').map((s: string) => s.trim()).filter(Boolean) }
  }

  return {
    ...t,
    teaching_scope: t.teaching_scope || 'students',
    teaching_modes: Array.isArray(modes) && modes.length > 0 ? modes : ['online', 'in_person'],
    highlights: Array.isArray(highlights) ? highlights : [],
    grades: Array.isArray(grades) ? grades : [],
    subjects: Array.isArray(subjects) ? subjects : [],
    cities: Array.isArray(cities) ? cities : [],
    pricing_options: Array.isArray(pricing) ? pricing : [],
    training_pricing_options: Array.isArray(trainingPricing) ? trainingPricing : [],
    training_topics: Array.isArray(trainingTopics) ? trainingTopics : [],
    training_target_levels: Array.isArray(targetLevels) ? targetLevels : [],
    training_bio: t.training_bio || null,
    training_certificate: t.training_certificate || null,
    training_video_url: t.training_video_url || null,
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
  return query<TutoringGrade>('SELECT * FROM yar_tutoring_grades WHERE is_active = true ORDER BY category ASC, display_order ASC, name ASC')
}

export async function getAllTutoringGrades(): Promise<TutoringGrade[]> {
  return query<TutoringGrade>('SELECT * FROM yar_tutoring_grades ORDER BY category ASC, display_order ASC, name ASC')
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

// ==========================================
// Teacher Reviews & Real Ratings
// ==========================================

export async function getApprovedTeacherReviews(teacherId: string): Promise<TeacherReview[]> {
  const rows = await query<TeacherReview>(`
    SELECT r.*, t.name as teacher_name, t.photo_url as teacher_photo
    FROM yar_teacher_reviews r
    LEFT JOIN yar_teachers t ON r.teacher_id = t.id
    WHERE r.teacher_id = $1 AND r.is_approved = true
    ORDER BY r.created_at DESC
  `, [teacherId])
  return rows.map(r => ({ ...r, rating: Number(r.rating) }))
}

export async function getAllTeacherReviews(teacherId?: string, status?: string): Promise<TeacherReview[]> {
  let sql = `
    SELECT r.*, t.name as teacher_name, t.photo_url as teacher_photo
    FROM yar_teacher_reviews r
    LEFT JOIN yar_teachers t ON r.teacher_id = t.id
    WHERE 1=1
  `
  const params: any[] = []
  if (teacherId && teacherId !== 'all') {
    params.push(teacherId)
    sql += ` AND r.teacher_id = $${params.length}`
  }
  if (status === 'pending') {
    sql += ` AND r.is_approved = false`
  } else if (status === 'approved') {
    sql += ` AND r.is_approved = true`
  }
  sql += ` ORDER BY r.created_at DESC`
  const rows = await query<TeacherReview>(sql, params)
  return rows.map(r => ({ ...r, rating: Number(r.rating) }))
}

export async function recalculateTeacherRating(teacherId: string): Promise<{ rating: number; count: number }> {
  const stats = await query<{ avg_rating: string | null; total_count: string }>(`
    SELECT 
      AVG(rating) as avg_rating,
      COUNT(*) as total_count
    FROM yar_teacher_reviews
    WHERE teacher_id = $1 AND is_approved = true
  `, [teacherId])

  const count = stats[0] ? Number(stats[0].total_count) : 0
  const avg = stats[0]?.avg_rating ? Number(Number(stats[0].avg_rating).toFixed(1)) : 5.0

  await query(`
    UPDATE yar_teachers 
    SET star_rating = $1, review_count = $2 
    WHERE id = $3
  `, [avg, count, teacherId])

  return { rating: avg, count }
}

export async function createTeacherReview(data: {
  teacher_id: string
  user_id?: string | null
  reviewer_name: string
  reviewer_role: ReviewerRole
  rating: number
  subject_or_topic?: string | null
  comment: string
  is_approved?: boolean
}): Promise<TeacherReview> {
  const rows = await query<TeacherReview>(`
    INSERT INTO yar_teacher_reviews (
      teacher_id, user_id, reviewer_name, reviewer_role, rating, subject_or_topic, comment, is_approved
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.teacher_id,
    data.user_id || null,
    data.reviewer_name.trim(),
    data.reviewer_role,
    Math.max(1, Math.min(5, Math.round(data.rating))),
    data.subject_or_topic?.trim() || null,
    data.comment.trim(),
    data.is_approved ?? false
  ])

  if (data.is_approved) {
    await recalculateTeacherRating(data.teacher_id)
  }

  return rows[0]
}

export async function updateTeacherReviewStatus(reviewId: string, isApproved: boolean): Promise<boolean> {
  const rows = await query<{ teacher_id: string }>(`
    UPDATE yar_teacher_reviews 
    SET is_approved = $1 
    WHERE id = $2 
    RETURNING teacher_id
  `, [isApproved, reviewId])

  if (rows[0]) {
    await recalculateTeacherRating(rows[0].teacher_id)
    return true
  }
  return false
}

export async function deleteTeacherReview(reviewId: string): Promise<boolean> {
  const rows = await query<{ teacher_id: string }>(`
    DELETE FROM yar_teacher_reviews 
    WHERE id = $1 
    RETURNING teacher_id
  `, [reviewId])

  if (rows[0]) {
    await recalculateTeacherRating(rows[0].teacher_id)
    return true
  }
  return false
}

// ==========================================
// Teacher Interactions & Review Eligibility
// ==========================================

export async function recordTeacherInteraction(
  userId: string,
  teacherId: string,
  interactionType: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await query(
    `INSERT INTO yar_teacher_interactions (user_id, teacher_id, interaction_type, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, teacherId, interactionType, JSON.stringify(metadata)]
  )
}

export async function checkUserTeacherEligibility(
  userId: string | null | undefined,
  teacherId: string
): Promise<{ canReview: boolean; reason?: 'unauthenticated' | 'no_interaction' | 'already_reviewed' }> {
  if (!userId) {
    return { canReview: false, reason: 'unauthenticated' }
  }

  // 1. Check if user already submitted a review for this teacher
  const existingReviews = await query(
    `SELECT id FROM yar_teacher_reviews 
     WHERE user_id = $1 AND teacher_id = $2 
     LIMIT 1`,
    [userId, teacherId]
  )
  if (existingReviews.length > 0) {
    return { canReview: false, reason: 'already_reviewed' }
  }

  // 2. Check if user has an interaction record (clicked phone, whatsapp, telegram, etc.)
  const interactions = await query(
    `SELECT id FROM yar_teacher_interactions 
     WHERE user_id = $1 AND teacher_id = $2 
     LIMIT 1`,
    [userId, teacherId]
  )

  if (interactions.length > 0) {
    return { canReview: true }
  }

  // 3. Check if user has submitted a tutoring booking request for this teacher
  const requests = await query(
    `SELECT id FROM yar_tutoring_requests 
     WHERE user_id = $1 AND teacher_id = $2 
     LIMIT 1`,
    [userId, teacherId]
  )

  if (requests.length > 0) {
    return { canReview: true }
  }

  return { canReview: false, reason: 'no_interaction' }
}

export async function requireAdmin() {
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null
  if (!user || user.role !== 'admin') return null
  return user
}
