import { NextResponse } from 'next/server'
import { requireAdmin, getAllTutoringGrades, getAllTutoringSubjects } from '@/lib/teachers'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
  try {
    const [grades, subjects] = await Promise.all([
      getAllTutoringGrades(),
      getAllTutoringSubjects()
    ])
    return NextResponse.json({ grades, subjects })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
