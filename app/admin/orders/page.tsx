import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { requireAdmin } from '@/lib/teachers'
import { query } from '@/lib/db'
import OrdersManager from '@/components/admin/OrdersManager'
import { cleanupExpiredOrders } from '@/lib/orders'

export default async function AdminOrdersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  // Auto-cleanup expired orders
  await cleanupExpiredOrders()

  // Fetch all orders
  const orders = await query(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM yar_orders o
    LEFT JOIN yar_users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `)

  // Fetch items for all orders
  const orderIds = orders.map((o: any) => o.id)
  let orderItems: any[] = []
  if (orderIds.length > 0) {
    orderItems = await query(`
      SELECT oi.*, s.title, s.thumbnail_url, s.is_digital
      FROM yar_order_items oi
      JOIN yar_store_items s ON oi.store_item_id = s.id
      WHERE oi.order_id = ANY($1)
    `, [orderIds])
  }

  // Combine and serialize dates
  const ordersWithItems = orders.map((order: any) => ({
    ...order,
    created_at: order.created_at ? new Date(order.created_at).toISOString() : '',
    paid_at: order.paid_at ? new Date(order.paid_at).toISOString() : null,
    items: orderItems.filter((i: any) => i.order_id === order.id)
  }))

  return (
    <div className="page bg-cream min-h-screen">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section py-6 md:py-10 max-w-7xl mx-auto">
        <OrdersManager initialOrders={ordersWithItems} />
      </main>
    </div>
  )
}
