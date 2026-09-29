import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import {
  requireAdmin,
  getAllTeacherReviews,
  updateTeacherReviewStatus,
  deleteTeacherReview
} from '@/lib/teachers'

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get('teacher_id') || undefined
  const status = searchParams.get('status') || undefined

  try {
    const reviews = await getAllTeacherReviews(teacherId, status)
    return NextResponse.json({ reviews })
  } catch (err: any) {
    return NextResponse.json({ error: 'خطا در بارگذاری نظرات: ' + err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { review_id, is_approved } = body

    if (!review_id || typeof is_approved !== 'boolean') {
      return NextResponse.json({ error: 'اطلاعات ارسالی نامعتبر است' }, { status: 400 })
    }

    const success = await updateTeacherReviewStatus(review_id, is_approved)
    if (!success) {
      return NextResponse.json({ error: 'نظر مورد نظر یافت نشد' }, { status: 404 })
    }

    revalidateTag('teachers')
    revalidatePath('/teachers')
    revalidatePath('/teacher-training')
    revalidatePath('/admin/teachers')

    return NextResponse.json({ success: true, is_approved })
  } catch (err: any) {
    return NextResponse.json({ error: 'خطا در تغییر وضعیت نظر: ' + err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { review_id } = body

    if (!review_id) {
      return NextResponse.json({ error: 'شناسه نظر الزامی است' }, { status: 400 })
    }

    const success = await deleteTeacherReview(review_id)
    if (!success) {
      return NextResponse.json({ error: 'نظر مورد نظر یافت نشد' }, { status: 404 })
    }

    revalidateTag('teachers')
    revalidatePath('/teachers')
    revalidatePath('/teacher-training')
    revalidatePath('/admin/teachers')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'خطا در حذف نظر: ' + err.message }, { status: 500 })
  }
}
