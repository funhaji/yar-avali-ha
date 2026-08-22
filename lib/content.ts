import { query } from './db'

export type ContentItem = {
  id: string
  title: string
  title_en: string | null
  description: string
  content_type: string
  tier_requirement: string
  age_tag: string | null
  grade_level: string | null
  category: string | null
  genre: string | null
  series_title: string | null
  episode_number: number | null
  duration_seconds: number | null
  video_url: string | null
  pixeldrain_id: string | null
  storage_provider: string | null
  r2_key: string | null
  gdrive_id: string | null
  thumbnail_url: string | null
  file_size_bytes: number | null
  view_count: number
  published: boolean
  created_at: string
  updated_at: string
}

export type ContentInput = Omit<ContentItem, 'id' | 'view_count' | 'created_at' | 'updated_at'> & {
  id?: string
}

export function normalizeContentInput(input: Partial<ContentInput>) {
  return {
    title: String(input.title || '').trim(),
    title_en: cleanOptional(input.title_en),
    description: String(input.description || '').trim(),
    content_type: String(input.content_type || 'lesson').trim(),
    tier_requirement: String(input.tier_requirement || 'free').trim(),
    age_tag: cleanOptional(input.age_tag),
    grade_level: cleanOptional(input.grade_level),
    category: cleanOptional(input.category),
    genre: cleanOptional(input.genre),
    series_title: cleanOptional(input.series_title),
    episode_number: toOptionalNumber(input.episode_number),
    duration_seconds: toOptionalNumber(input.duration_seconds),
    video_url: cleanOptional(input.video_url),
    pixeldrain_id: cleanOptional(input.pixeldrain_id),
    storage_provider: cleanOptional(input.storage_provider) || 'pixeldrain',
    r2_key: cleanOptional(input.r2_key),
    gdrive_id: cleanOptional(input.gdrive_id),
    thumbnail_url: cleanOptional(input.thumbnail_url),
    file_size_bytes: toOptionalNumber(input.file_size_bytes),
    published: Boolean(input.published),
  }
}

export function validateContentInput(input: ReturnType<typeof normalizeContentInput>) {
  if (!input.title) return 'عنوان لازم است.'
  return null
}

export async function getAllContentItems() {
  return query<ContentItem>('SELECT * FROM yar_content_items ORDER BY created_at DESC')
}

function cleanOptional(value: unknown) {
  const text = String(value || '').trim()
  return text ? text : null
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
