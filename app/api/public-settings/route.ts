import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

const ALLOWED_PUBLIC_KEYS = [
  'site_name',
  'site_logo_url',
  'admin_card_number',
  'admin_card_name',
  'payment_gateway_enabled',
  'contact_phone',
  'contact_telegram_id',
  'contact_email',
  'footer_text'
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedKeysStr = searchParams.get('keys')
    
    let keysToFetch = ALLOWED_PUBLIC_KEYS
    if (requestedKeysStr) {
      const requestedKeys = requestedKeysStr.split(',').map(k => k.trim()).filter(Boolean)
      keysToFetch = requestedKeys.filter(k => ALLOWED_PUBLIC_KEYS.includes(k))
      if (keysToFetch.length === 0) {
        keysToFetch = ALLOWED_PUBLIC_KEYS
      }
    }

    const settings = await getSettings(keysToFetch)
    
    return NextResponse.json({
      ...settings,
      settings
    })
  } catch (error: any) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
