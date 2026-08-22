import { query } from './db'

export type StoreItem = {
  id: string
  title: string
  description: string | null
  price_cents: number
  discount_price_cents: number | null
  stock_quantity: number | null
  is_digital: boolean
  is_free: boolean
  is_downloadable: boolean
  is_published: boolean
  display_order: number
  content_type: string | null
  storage_provider: string | null
  pixeldrain_id: string | null
  gdrive_id: string | null
  r2_key: string | null
  thumbnail_url: string | null
  images: string[] | null
  category: string | null
  tags: string[] | null
  file_url: string | null
  created_at: Date
  updated_at: Date
}

export async function getStoreItems(filters?: {
  search?: string
  category?: string
  is_digital?: boolean
  min_price?: number
  max_price?: number
  sort?: string
}): Promise<StoreItem[]> {
  let sql = 'SELECT * FROM yar_store_items WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  if (filters?.search) {
    sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters?.category && filters.category !== 'all') {
    sql += ` AND category = $${paramIndex}`
    params.push(filters.category)
    paramIndex++
  }

  if (filters?.is_digital !== undefined) {
    sql += ` AND is_digital = $${paramIndex}`
    params.push(filters.is_digital)
    paramIndex++
  }

  if (filters?.min_price !== undefined) {
    sql += ` AND price_cents >= $${paramIndex}`
    params.push(filters.min_price)
    paramIndex++
  }

  if (filters?.max_price !== undefined) {
    sql += ` AND price_cents <= $${paramIndex}`
    params.push(filters.max_price)
    paramIndex++
  }

  sql += ' AND is_published = true'

  if (filters?.sort === 'price_asc') {
    sql += ' ORDER BY display_order DESC, COALESCE(discount_price_cents, price_cents) ASC'
  } else if (filters?.sort === 'price_desc') {
    sql += ' ORDER BY display_order DESC, COALESCE(discount_price_cents, price_cents) DESC'
  } else {
    sql += ' ORDER BY display_order DESC, created_at DESC'
  }

  return await query<StoreItem>(sql, params)
}

export async function getStoreItemById(id: string): Promise<StoreItem | null> {
  const items = await query<StoreItem>('SELECT * FROM yar_store_items WHERE id = $1', [id])
  return items[0] || null
}

export async function createStoreItem(data: Partial<StoreItem>): Promise<StoreItem> {
  const fields = [
    'title', 'description', 'price_cents', 'discount_price_cents', 
    'stock_quantity', 'is_digital', 'is_free', 'is_downloadable', 
    'is_published', 'display_order',
    'content_type', 'storage_provider', 'pixeldrain_id', 'gdrive_id', 'r2_key',
    'thumbnail_url', 'images', 'category', 'tags', 'file_url'
  ]
  
  const values = []
  const placeholders = []
  const insertFields = []

  let index = 1
  for (const field of fields) {
    if (data[field as keyof StoreItem] !== undefined) {
      insertFields.push(field)
      values.push(data[field as keyof StoreItem])
      placeholders.push(`$${index}`)
      index++
    }
  }

  const sql = `
    INSERT INTO yar_store_items (${insertFields.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `

  const result = await query<StoreItem>(sql, values)
  return result[0]
}

export async function updateStoreItem(id: string, data: Partial<StoreItem>): Promise<StoreItem> {
  const fields = [
    'title', 'description', 'price_cents', 'discount_price_cents', 
    'stock_quantity', 'is_digital', 'is_free', 'is_downloadable', 
    'is_published', 'display_order',
    'content_type', 'storage_provider', 'pixeldrain_id', 'gdrive_id', 'r2_key',
    'thumbnail_url', 'images', 'category', 'tags', 'file_url'
  ]
  
  const values = []
  const setClauses = []

  let index = 1
  for (const field of fields) {
    if (data[field as keyof StoreItem] !== undefined) {
      setClauses.push(`${field} = $${index}`)
      values.push(data[field as keyof StoreItem])
      index++
    }
  }

  setClauses.push(`updated_at = NOW()`)
  values.push(id)

  const sql = `
    UPDATE yar_store_items
    SET ${setClauses.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `

  const result = await query<StoreItem>(sql, values)
  return result[0]
}

export async function deleteStoreItem(id: string): Promise<void> {
  await query('DELETE FROM yar_store_items WHERE id = $1', [id])
}

export async function getCategories(): Promise<{ category: string, count: number }[]> {
  const results = await query(`
    SELECT category, COUNT(*) as count 
    FROM yar_store_items 
    WHERE category IS NOT NULL AND is_published = true
    GROUP BY category
    ORDER BY count DESC
  `)
  return results
}

export async function getRelatedStoreItems(id: string, limit: number = 3): Promise<StoreItem[]> {
  const item = await getStoreItemById(id)
  if (!item || !item.category) return []

  const sql = `
    SELECT * FROM yar_store_items 
    WHERE category = $1 AND id != $2 AND is_published = true
    ORDER BY display_order DESC, created_at DESC
    LIMIT $3
  `
  return await query<StoreItem>(sql, [item.category, id, limit])
}
