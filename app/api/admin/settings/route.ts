import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { validateSession } from '@/lib/auth'
import { getAllSettings, setSetting, deleteSetting, setSettingsBatch } from '@/lib/settings'

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
    
    const settings = await getAllSettings()
    return NextResponse.json({ settings })
    
  } catch (error: any) {
    console.error('Settings GET error:', error)
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
    const { key, value, type, action, settings } = body
    
    if (action === 'delete') {
      await deleteSetting(key)
      revalidateTag('settings')
      return NextResponse.json({ success: true })
    }

    // Batch update mode
    if (settings && Array.isArray(settings)) {
      const validSettings = settings.filter(s => s.key)
      if (validSettings.length > 0) {
        await setSettingsBatch(validSettings)
      }
      revalidateTag('settings')
      return NextResponse.json({ success: true })
    }
    
    // Single update mode
    if (!key) {
      return NextResponse.json({ error: 'Key or settings array is required' }, { status: 400 })
    }
    
    await setSetting(key, value || '', type || 'text')
    revalidateTag('settings')
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
