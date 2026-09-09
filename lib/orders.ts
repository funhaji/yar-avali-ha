import { query } from './db'

export type OrderItemDetail = {
  id: string
  order_id: string
  store_item_id: string
  quantity: number
  price_cents: number
  title: string
  thumbnail_url: string | null
  is_digital: boolean
  content_type?: string
  file_url?: string | null
  is_downloadable?: boolean
}

export type OrderDetail = {
  id: string
  user_id: string
  full_name: string
  phone: string
  shipping_address: string | null
  postal_code: string | null
  total_cents: number
  status: string
  payment_method: string | null
  payment_gateway_ref: string | null
  payment_authority: string | null
  receipt_url: string | null
  paid_at: string | Date | null
  created_at: string | Date
  notes: string | null
  items: OrderItemDetail[]
  has_physical: boolean
  has_digital: boolean
  remaining_hours: number
  expires_at: string | Date
}

// 1. Database Index Initialization
let indexesEnsured = false
export async function ensureOrderIndexes() {
  if (indexesEnsured) return
  try {
    await query(`
      CREATE INDEX IF NOT EXISTS idx_yar_orders_user_status ON yar_orders(user_id, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_yar_orders_expiry ON yar_orders(status, paid_at, created_at);
    `)
    indexesEnsured = true
  } catch (err) {
    console.error('Failed to create order indexes:', err)
  }
}

// 2. Automatic 3-Day Cleanup for Unpaid Orders
export async function cleanupExpiredOrders(userId?: string): Promise<number> {
  try {
    await ensureOrderIndexes()
    
    // Find expired orders (pending_payment, unpaid, created > 3 days ago)
    const sql = userId
      ? `DELETE FROM yar_orders 
         WHERE user_id = $1 
           AND status = 'pending_payment' 
           AND paid_at IS NULL 
           AND created_at < NOW() - INTERVAL '3 days'
         RETURNING id`
      : `DELETE FROM yar_orders 
         WHERE status = 'pending_payment' 
           AND paid_at IS NULL 
           AND created_at < NOW() - INTERVAL '3 days'
         RETURNING id`
         
    const params = userId ? [userId] : []
    const deleted = await query(sql, params)
    return deleted.length
  } catch (err) {
    console.error('Error cleaning up expired orders:', err)
    return 0
  }
}

// 3. Get Active Pending Order for a User (fast lookup for Shop banner & Cart)
export async function getUserPendingOrder(userId: string): Promise<OrderDetail | null> {
  await cleanupExpiredOrders(userId)
  
  const orders = await query<any>(
    `SELECT o.*
     FROM yar_orders o
     WHERE o.user_id = $1 AND o.status IN ('pending_payment', 'pending_approval')
     ORDER BY o.created_at DESC
     LIMIT 1`,
    [userId]
  )
  
  if (orders.length === 0) return null
  const order = orders[0]
  
  // Fetch items for this pending order
  const items = await query<OrderItemDetail>(
    `SELECT oi.id, oi.order_id, oi.store_item_id, oi.quantity, oi.price_cents,
            s.title, s.thumbnail_url, s.is_digital, s.content_type, s.file_url, s.is_downloadable
     FROM yar_order_items oi
     JOIN yar_store_items s ON oi.store_item_id = s.id
     WHERE oi.order_id = $1`,
    [order.id]
  )
  
  const createdAt = new Date(order.created_at)
  const expiresAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
  const remainingHours = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))
  
  return {
    ...order,
    items,
    has_physical: items.some(i => !i.is_digital),
    has_digital: items.some(i => i.is_digital),
    remaining_hours: remainingHours,
    expires_at: expiresAt
  }
}

// 4. Get All Orders for User with Items and Breakdown
export async function getUserOrders(userId: string): Promise<OrderDetail[]> {
  await cleanupExpiredOrders(userId)
  
  const orders = await query<any>(
    `SELECT o.* 
     FROM yar_orders o
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  )
  
  if (orders.length === 0) return []
  
  const orderIds = orders.map(o => o.id)
  const orderItems = await query<OrderItemDetail>(
    `SELECT oi.id, oi.order_id, oi.store_item_id, oi.quantity, oi.price_cents,
            s.title, s.thumbnail_url, s.is_digital, s.content_type, s.file_url, s.is_downloadable
     FROM yar_order_items oi
     JOIN yar_store_items s ON oi.store_item_id = s.id
     WHERE oi.order_id = ANY($1)
     ORDER BY oi.id ASC`,
    [orderIds]
  )
  
  return orders.map(order => {
    const items = orderItems.filter(item => item.order_id === order.id)
    const createdAt = new Date(order.created_at)
    const expiresAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
    const remainingHours = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))
    
    return {
      ...order,
      items,
      has_physical: items.some(i => !i.is_digital),
      has_digital: items.some(i => i.is_digital),
      remaining_hours: remainingHours,
      expires_at: expiresAt
    }
  })
}
