import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      teacher_id, 
      student_name, 
      phone, 
      teaching_mode = 'online', 
      teaching_type = 'student',
      grade, 
      subject, 
      duration_minutes, 
      preferred_time, 
      city, 
      notes 
    } = body

    if (!teacher_id) {
      return NextResponse.json({ error: 'انتخاب استاد الزامی است' }, { status: 400 })
    }

    if (!student_name || !student_name.trim()) {
      return NextResponse.json({ error: 'نام و نام خانوادگی الزامی است' }, { status: 400 })
    }

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json({ error: 'شماره تماس معتبر الزامی است' }, { status: 400 })
    }

    // Optional user session detection
    let userId: string | null = null
    const token = (await cookies()).get('session_token')?.value
    if (token) {
      const user = await validateSession(token).catch(() => null)
      if (user) userId = user.id
    }

    const rows = await query(`
      INSERT INTO yar_tutoring_requests (
        teacher_id, 
        user_id, 
        student_name, 
        phone, 
        teaching_mode, 
        teaching_type,
        grade, 
        subject, 
        duration_minutes, 
        preferred_time, 
        city, 
        notes, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *
    `, [
      teacher_id,
      userId,
      student_name.trim(),
      phone.trim(),
      teaching_mode,
      teaching_type === 'teacher_training' ? 'teacher_training' : 'student',
      grade || null,
      subject || null,
      duration_minutes ? Number(duration_minutes) : null,
      preferred_time || null,
      city || null,
      notes || null
    ])

    if (userId) {
      await query(
        `INSERT INTO yar_teacher_interactions (user_id, teacher_id, interaction_type, metadata)
         VALUES ($1, $2, $3, $4)`,
        [userId, teacher_id, 'booking_request', JSON.stringify({ student_name, teaching_type })]
      ).catch(() => {})
    }

    return NextResponse.json({ 
      success: true, 
      message: 'درخواست شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.',
      request: rows[0] 
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'خطا در ثبت درخواست: ' + error.message }, { status: 500 })
  }
}
