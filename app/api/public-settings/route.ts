import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export async function GET() {
  try {
    // Only return public settings that are safe to expose
    const publicKeys = ['site_name', 'site_logo_url']
    const settings = await getSettings(publicKeys)
    
    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
