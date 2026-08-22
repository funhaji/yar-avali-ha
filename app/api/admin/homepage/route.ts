import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getAllHomepageSections, saveHomepageSection, deleteHomepageSection } from '@/lib/settings'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await validateSession(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const sections = await getAllHomepageSections()
    return NextResponse.json({ sections })
    
  } catch (error: any) {
    console.error('Homepage GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await validateSession(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { action, section } = body
    
    if (action === 'delete' && section?.id) {
      await deleteHomepageSection(section.id)
      return NextResponse.json({ success: true })
    }
    
    if (!section || !section.section_type) {
      return NextResponse.json({ error: 'Section data is required' }, { status: 400 })
    }
    
    const id = await saveHomepageSection(section)
    
    return NextResponse.json({ success: true, id })
    
  } catch (error: any) {
    console.error('Homepage POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
