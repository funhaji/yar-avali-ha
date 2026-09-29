import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import { query } from '@/lib/db'
import { getAllTeachers, requireAdmin, normalizeTeacher } from '@/lib/teachers'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  return NextResponse.json({ teachers: await getAllTeachers() })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'عدم دسترسی' }, { status: 403 })
  const body = await request.json()
  const {
    name, specialty, bio, photo_url, display_order, is_visible, video_url,
    education, location, workplace, experience_years, national_rank, provincial_rank, district_rank,
    contact_phone, telegram_id, whatsapp_id, eitaa_id, instagram_id,
    teaching_modes, badge_text, star_rating, review_count, successful_sessions,
    highlights, pricing_options, availability_schedule, grades, subjects, cities,
    teaching_scope, training_topics, training_target_levels, training_bio,
    training_certificate, training_video_url, training_pricing_options
  } = body

  if (!name) return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 })

  const modesArr = Array.isArray(teaching_modes) && teaching_modes.length > 0 ? teaching_modes : ['online', 'in_person']
  const highlightsArr = Array.isArray(highlights) ? highlights : (typeof highlights === 'string' ? highlights.split('\n').map((s: string) => s.trim()).filter(Boolean) : [])
  const gradesArr = Array.from(new Set((Array.isArray(grades) ? grades : (typeof grades === 'string' ? grades.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const subjectsArr = Array.from(new Set((Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const citiesArr = Array.from(new Set((Array.isArray(cities) ? cities : (typeof cities === 'string' ? cities.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const pricingJson = JSON.stringify(Array.isArray(pricing_options) ? pricing_options : [])
  const availabilityJson = JSON.stringify(availability_schedule && typeof availability_schedule === 'object' ? availability_schedule : {})

  // Teacher training arrays & json
  const trainingTopicsArr = Array.from(new Set((Array.isArray(training_topics) ? training_topics : (typeof training_topics === 'string' ? training_topics.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const targetLevelsArr = Array.from(new Set((Array.isArray(training_target_levels) ? training_target_levels : (typeof training_target_levels === 'string' ? training_target_levels.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const trainingPricingJson = JSON.stringify(Array.isArray(training_pricing_options) ? training_pricing_options : [])
  const validScope = ['students', 'teachers', 'both'].includes(teaching_scope) ? teaching_scope : 'students'

  try {
    const rows = await query(
      `INSERT INTO yar_teachers (
        name, specialty, bio, photo_url, display_order, is_visible, video_url,
        education, location, workplace, experience_years, national_rank, provincial_rank, district_rank,
        contact_phone, telegram_id, whatsapp_id, eitaa_id, instagram_id,
        teaching_modes, badge_text, star_rating, review_count, successful_sessions,
        highlights, pricing_options, availability_schedule, grades, subjects, cities,
        teaching_scope, training_topics, training_target_levels, training_bio,
        training_certificate, training_video_url, training_pricing_options
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,
        $25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37
      ) RETURNING *`,
      [
        name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, video_url || null,
        education || null, location || null, workplace || null,
        experience_years ? Number(experience_years) : null,
        national_rank ? Number(national_rank) : null,
        provincial_rank ? Number(provincial_rank) : null,
        district_rank ? Number(district_rank) : null,
        contact_phone || null, telegram_id || null, whatsapp_id || null, eitaa_id || null, instagram_id || null,
        modesArr, badge_text || null,
        star_rating !== undefined && star_rating !== null && star_rating !== '' ? Number(star_rating) : 5.0,
        review_count !== undefined && review_count !== null && review_count !== '' ? Number(review_count) : 0,
        successful_sessions !== undefined && successful_sessions !== null && successful_sessions !== '' ? Number(successful_sessions) : 0,
        highlightsArr, pricingJson, availabilityJson, gradesArr, subjectsArr, citiesArr,
        validScope, trainingTopicsArr, targetLevelsArr, training_bio || null,
        training_certificate || null, training_video_url || null, trainingPricingJson
      ]
    )
    revalidateTag('teachers')
    revalidatePath('/teacher-training')
    revalidatePath('/teachers')
    revalidatePath('/admin/teachers')
    return NextResponse.json({ teacher: normalizeTeacher(rows[0]) })
  } catch (e: any) {
    return NextResponse.json({ error: 'خطا در دیتابیس: ' + e.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'عدم دسترسی' }, { status: 403 })
  const body = await request.json()
  const {
    id, name, specialty, bio, photo_url, display_order, is_visible, video_url,
    education, location, workplace, experience_years, national_rank, provincial_rank, district_rank,
    contact_phone, telegram_id, whatsapp_id, eitaa_id, instagram_id,
    teaching_modes, badge_text, star_rating, review_count, successful_sessions,
    highlights, pricing_options, availability_schedule, grades, subjects, cities,
    teaching_scope, training_topics, training_target_levels, training_bio,
    training_certificate, training_video_url, training_pricing_options
  } = body

  if (!id) return NextResponse.json({ error: 'ایدی الزامی است' }, { status: 400 })

  const modesArr = Array.isArray(teaching_modes) && teaching_modes.length > 0 ? teaching_modes : ['online', 'in_person']
  const highlightsArr = Array.isArray(highlights) ? highlights : (typeof highlights === 'string' ? highlights.split('\n').map((s: string) => s.trim()).filter(Boolean) : [])
  const gradesArr = Array.from(new Set((Array.isArray(grades) ? grades : (typeof grades === 'string' ? grades.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const subjectsArr = Array.from(new Set((Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const citiesArr = Array.from(new Set((Array.isArray(cities) ? cities : (typeof cities === 'string' ? cities.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const pricingJson = JSON.stringify(Array.isArray(pricing_options) ? pricing_options : [])
  const availabilityJson = JSON.stringify(availability_schedule && typeof availability_schedule === 'object' ? availability_schedule : {})

  // Teacher training arrays & json
  const trainingTopicsArr = Array.from(new Set((Array.isArray(training_topics) ? training_topics : (typeof training_topics === 'string' ? training_topics.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const targetLevelsArr = Array.from(new Set((Array.isArray(training_target_levels) ? training_target_levels : (typeof training_target_levels === 'string' ? training_target_levels.split(',') : [])).map((s: any) => String(s).trim()).filter(Boolean)))
  const trainingPricingJson = JSON.stringify(Array.isArray(training_pricing_options) ? training_pricing_options : [])
  const validScope = ['students', 'teachers', 'both'].includes(teaching_scope) ? teaching_scope : 'students'

  try {
    const rows = await query(
      `UPDATE yar_teachers SET
        name=$1, specialty=$2, bio=$3, photo_url=$4, display_order=$5, is_visible=$6, video_url=$7,
        education=$8, location=$9, workplace=$10, experience_years=$11, national_rank=$12, provincial_rank=$13, district_rank=$14,
        contact_phone=$15, telegram_id=$16, whatsapp_id=$17, eitaa_id=$18, instagram_id=$19,
        teaching_modes=$20, badge_text=$21, star_rating=$22, review_count=$23, successful_sessions=$24,
        highlights=$25, pricing_options=$26, availability_schedule=$27, grades=$28, subjects=$29, cities=$30,
        teaching_scope=$31, training_topics=$32, training_target_levels=$33, training_bio=$34,
        training_certificate=$35, training_video_url=$36, training_pricing_options=$37,
        updated_at=NOW()
      WHERE id=$38 RETURNING *`,
      [
        name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, video_url || null,
        education || null, location || null, workplace || null,
        experience_years ? Number(experience_years) : null,
        national_rank ? Number(national_rank) : null,
        provincial_rank ? Number(provincial_rank) : null,
        district_rank ? Number(district_rank) : null,
        contact_phone || null, telegram_id || null, whatsapp_id || null, eitaa_id || null, instagram_id || null,
        modesArr, badge_text || null,
        star_rating !== undefined && star_rating !== null && star_rating !== '' ? Number(star_rating) : 5.0,
        review_count !== undefined && review_count !== null && review_count !== '' ? Number(review_count) : 0,
        successful_sessions !== undefined && successful_sessions !== null && successful_sessions !== '' ? Number(successful_sessions) : 0,
        highlightsArr, pricingJson, availabilityJson, gradesArr, subjectsArr, citiesArr,
        validScope, trainingTopicsArr, targetLevelsArr, training_bio || null,
        training_certificate || null, training_video_url || null, trainingPricingJson,
        id
      ]
    )
    revalidateTag('teachers')
    revalidatePath('/teacher-training')
    revalidatePath('/teachers')
    revalidatePath('/admin/teachers')
    return NextResponse.json({ teacher: normalizeTeacher(rows[0]) })
  } catch (e: any) {
    return NextResponse.json({ error: 'خطا در دیتابیس: ' + e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  const { id } = await request.json()
  const rows = await query<{ photo_url: string | null }>('DELETE FROM yar_teachers WHERE id=$1 RETURNING photo_url', [id])
  const photo = rows[0]?.photo_url
  if (photo && photo.includes('blob.vercel-storage.com')) {
    try { await del(photo) } catch { /* ignore missing blob */ }
  }
  revalidateTag('teachers')
  revalidatePath('/teacher-training')
  revalidatePath('/teachers')
  revalidatePath('/admin/teachers')
  return NextResponse.json({ success: true })
}
