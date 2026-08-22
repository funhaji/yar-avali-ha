import { query } from './db'

export type CartItem = {
  id: string
  user_id: string
  store_item_id: string
  quantity: number
  created_at: Date
  updated_at: Date
  // Joined fields from store_item
  title?: string
  price_cents?: number
  discount_price_cents?: number | null
  thumbnail_url?: string | null
  is_digital?: boolean
  stock_quantity?: number | null
}

export async function getCart(userId: string): Promise<CartItem[]> {
  const sql = `
    SELECT 
      c.id, c.user_id, c.store_item_id, c.quantity, c.created_at, c.updated_at,
      s.title, s.price_cents, s.discount_price_cents, s.thumbnail_url, s.is_digital, s.stock_quantity
    FROM yar_cart_items c
    JOIN yar_store_items s ON c.store_item_id = s.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `
  return await query<CartItem>(sql, [userId])
}

export async function addToCart(userId: string, storeItemId: string, quantity: number = 1): Promise<void> {
  // Check if item exists in cart
  const existing = await query<CartItem>(
    'SELECT * FROM yar_cart_items WHERE user_id = $1 AND store_item_id = $2',
    [userId, storeItemId]
  )

  if (existing.length > 0) {
    // Update quantity
    await query(
      'UPDATE yar_cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2',
      [quantity, existing[0].id]
    )
  } else {
    // Insert new
    await query(
      'INSERT INTO yar_cart_items (user_id, store_item_id, quantity) VALUES ($1, $2, $3)',
      [userId, storeItemId, quantity]
    )
  }
}

export async function updateCartQuantity(cartItemId: string, userId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeFromCart(cartItemId, userId)
    return
  }
  
  await query(
    'UPDATE yar_cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
    [quantity, cartItemId, userId]
  )
}

export async function removeFromCart(cartItemId: string, userId: string): Promise<void> {
  await query('DELETE FROM yar_cart_items WHERE id = $1 AND user_id = $2', [cartItemId, userId])
}

export async function clearCart(userId: string): Promise<void> {
  await query('DELETE FROM yar_cart_items WHERE user_id = $1', [userId])
}
