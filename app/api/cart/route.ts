import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } from '@/lib/cart'

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cart = await getCart(user.id)
    return NextResponse.json(cart)
  } catch (error) {
    console.error('Cart API GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { store_item_id, quantity = 1 } = body
    
    if (!store_item_id) return NextResponse.json({ error: 'store_item_id is required' }, { status: 400 })

    await addToCart(user.id, store_item_id, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart API POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { cart_item_id, quantity } = body
    
    if (!cart_item_id || quantity === undefined) {
      return NextResponse.json({ error: 'cart_item_id and quantity are required' }, { status: 400 })
    }

    await updateCartQuantity(cart_item_id, user.id, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart API PUT Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const token = (await cookies()).get('session_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const user = await validateSession(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cart_item_id = searchParams.get('cart_item_id')
    const clear_all = searchParams.get('clear_all') === 'true'

    if (clear_all) {
      await clearCart(user.id)
    } else if (cart_item_id) {
      await removeFromCart(cart_item_id, user.id)
    } else {
      return NextResponse.json({ error: 'cart_item_id or clear_all required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart API DELETE Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
