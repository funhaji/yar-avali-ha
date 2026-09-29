import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { recordTeacherInteraction, getTeacherById } from '@/lib/teachers'

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

    const token = (await cookies()).get('session_token')?.value
    const user = token ? await validateSession(token).catch(() => null) : null

    if (!user) {
      // User is not logged in; don't record to DB, but return success so client flow isn't blocked
      return NextResponse.json({ success: true, recorded: false, reason: 'guest' })
    }

    const body = await request.json().catch(() => ({}))
    const interactionType = body.interaction_type || 'contact'
    const metadata = body.metadata || {}

    await recordTeacherInteraction(user.id, id, interactionType, metadata)

    return NextResponse.json({
      success: true,
      recorded: true
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'خطا در ثبت تعامل: ' + err.message }, { status: 500 })
  }
}
