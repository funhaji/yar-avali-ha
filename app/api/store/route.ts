import { NextResponse } from 'next/server'
import { getStoreItems } from '@/lib/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    
    const isDigitalRaw = searchParams.get('is_digital')
    const is_digital = isDigitalRaw === 'true' ? true : isDigitalRaw === 'false' ? false : undefined
    
    const minPriceRaw = searchParams.get('min_price')
    const min_price = minPriceRaw ? parseInt(minPriceRaw) : undefined
    
    const maxPriceRaw = searchParams.get('max_price')
    const max_price = maxPriceRaw ? parseInt(maxPriceRaw) : undefined

    const items = await getStoreItems({ search, category, is_digital, min_price, max_price })
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Store API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
