import { unstable_cache } from 'next/cache'
import { query } from './db'
import { SiteSetting, HomepageSection } from './settings'

// ----------------------------------------------------------------------
// Settings Cache
// ----------------------------------------------------------------------
export const getCachedAllSettings = unstable_cache(
  async () => {
    return query<SiteSetting>('SELECT * FROM yar_site_settings')
  },
  ['all-site-settings'],
  { tags: ['settings'], revalidate: 3600 } // Revalidate every hour or on-demand
)

export async function getCachedSettings(keys: string[]): Promise<Record<string, string | null>> {
  const allSettings = await getCachedAllSettings()
  const settings: Record<string, string | null> = {}
  keys.forEach(key => { settings[key] = null })
  
  allSettings.forEach(setting => {
    if (keys.includes(setting.setting_key)) {
      settings[setting.setting_key] = setting.setting_value
    }
  })
  return settings
}

// ----------------------------------------------------------------------
// Store Cache (Books, Shop)
// ----------------------------------------------------------------------
export const getCachedStoreItems = unstable_cache(
  async (category?: string) => {
    let results
    if (category) {
      results = await query(`
        SELECT * FROM yar_store_items 
        WHERE is_published = true AND category = $1
        ORDER BY created_at DESC
      `, [category])
    } else {
      results = await query(`
        SELECT * FROM yar_store_items 
        WHERE is_published = true 
        ORDER BY created_at DESC
      `)
    }
    return results
  },
  ['store-items-published'],
  { tags: ['store'], revalidate: 1800 }
)

// ----------------------------------------------------------------------
// Content Cache (Entertainment, Worksheets, etc)
// ----------------------------------------------------------------------
export const getCachedContent = unstable_cache(
  async (contentType?: string, category?: string) => {
    let sql = 'SELECT * FROM yar_content_items WHERE published = true'
    const params: any[] = []
    let paramIndex = 1

    if (contentType) {
      sql += ` AND content_type = $${paramIndex++}`
      params.push(contentType)
    }

    if (category) {
      sql += ` AND category = $${paramIndex++}`
      params.push(category)
    }

    sql += ' ORDER BY created_at DESC'
    return query(sql, params)
  },
  ['published-content-items'],
  { tags: ['content'], revalidate: 1800 }
)

// ----------------------------------------------------------------------
// Teachers Cache
// ----------------------------------------------------------------------
export const getCachedTeachers = unstable_cache(
  async () => {
    return query(`
      SELECT * FROM yar_teachers 
      WHERE is_visible = true 
      ORDER BY display_order ASC, created_at DESC
    `)
  },
  ['visible-teachers'],
  { tags: ['teachers'], revalidate: 3600 }
)

// ----------------------------------------------------------------------
// Blog Cache
// ----------------------------------------------------------------------
export const getCachedBlogPosts = unstable_cache(
  async () => {
    return query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.thumbnail_url, p.created_at, p.view_count, p.redirect_url, u.name as author_name 
      FROM yar_blog_posts p 
      LEFT JOIN yar_users u ON p.author_id = u.id 
      WHERE p.published = true 
      ORDER BY p.created_at DESC
    `)
  },
  ['published-blog-posts'],
  { tags: ['blog'], revalidate: 1800 }
)
