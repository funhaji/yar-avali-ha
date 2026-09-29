import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getTeacherById, getApprovedTeacherReviews, createTeacherReview } from '@/lib/teachers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const teacher = await getTeacherById(id)
    if (!teacher) {
      return NextResponse.json({ error: 'معلم یافت نشد' }, { status: 404 })
    }

    const reviews = await getApprovedTeacherReviews(id)

    const token = (await cookies()).get('session_token')?.value
    const user = token ? await validateSession(token).catch(() => null) : null

    const { checkUserTeacherEligibility } = await import('@/lib/teachers')
    const eligibility = user ? await checkUserTeacherEligibility(user.id, id) : { canReview: false, reason: 'unauthenticated' }

    return NextResponse.json({
      reviews,
      stats: {
        star_rating: teacher.star_rating || 5.0,
        review_count: teacher.review_count || 0
      },
      user: user ? { id: user.id, name: user.name } : null,
      eligibility
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'خطا در بارگذاری نظرات: ' + err.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const teacher = await getTeacherById(id)
    if (!teacher) {
      return NextResponse.json({ error: 'معلم یافت نشد' }, { status: 404 })
    }

    const body = await request.json()
    const { reviewer_name, reviewer_role, rating, subject_or_topic, comment } = body

    if (!reviewer_name || typeof reviewer_name !== 'string' || reviewer_name.trim().length < 2) {
      return NextResponse.json({ error: 'لطفاً نام و نام خانوادگی معتبر وارد کنید' }, { status: 400 })
    }

    if (!['parent', 'teacher'].includes(reviewer_role)) {
      return NextResponse.json({ error: 'نقش نامعتبر است' }, { status: 400 })
    }

    const numRating = Number(rating)
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'امتیاز باید عددی بین ۱ تا ۵ باشد' }, { status: 400 })
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({ error: 'متن نظر باید حداقل ۵ کاراکتر باشد' }, { status: 400 })
    }

    // Enforce registered user and interaction requirement
    const token = (await cookies()).get('session_token')?.value
    const user = token ? await validateSession(token).catch(() => null) : null

    if (!user) {
      return NextResponse.json({
        error: 'برای ثبت نظر و امتیاز، ابتدا باید وارد حساب کاربری خود شوید.'
      }, { status: 401 })
    }

    const { checkUserTeacherEligibility } = await import('@/lib/teachers')
    const eligibility = await checkUserTeacherEligibility(user.id, id)
    if (!eligibility.canReview) {
      if (eligibility.reason === 'already_reviewed') {
        return NextResponse.json({
          error: 'شما قبلاً نظر و امتیاز خود را برای این استاد ثبت کرده‌اید.'
        }, { status: 400 })
      }
      return NextResponse.json({
        error: 'تنها کاربرانی که با این استاد ارتباط برقرار کرده (تماس، پیام‌رسان‌ها یا درخواست کلاس) امکان ثبت نظر و امتیاز را دارند.'
      }, { status: 403 })
    }

    // By default, require admin approval (is_approved: false)
    const review = await createTeacherReview({
      teacher_id: id,
      user_id: user.id,
      reviewer_name: reviewer_name.trim(),
      reviewer_role: reviewer_role as 'parent' | 'teacher',
      rating: numRating,
      subject_or_topic: subject_or_topic ? String(subject_or_topic).trim() : null,
      comment: comment.trim(),
      is_approved: false
    })

    return NextResponse.json({
      success: true,
      message: 'نظر و امتیاز شما با موفقیت ثبت شد و پس از بررسی و تایید مدیریت نمایش داده خواهد شد.',
      review
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'خطا در ثبت نظر: ' + err.message }, { status: 500 })
  }
}
