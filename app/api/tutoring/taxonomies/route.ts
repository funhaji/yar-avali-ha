import { NextResponse } from 'next/server'
import { getActiveTutoringGrades, getActiveTutoringSubjects } from '@/lib/teachers'

export const revalidate = 60

export async function GET() {
  try {
    const [grades, subjects] = await Promise.all([
      getActiveTutoringGrades().catch(() => []),
      getActiveTutoringSubjects().catch(() => [])
    ])
    return NextResponse.json({ grades, subjects })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
