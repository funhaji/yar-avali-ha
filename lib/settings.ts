import { query } from './db'

export type SiteSetting = {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: string
  updated_at: Date
}

export type HomepageSection = {
  id: string
  section_type: string
  title: string | null
  subtitle: string | null
  display_order: number
  is_visible: boolean
  content_ids: string[]
  settings: any
  created_at: Date
  updated_at: Date
}

// Get a single setting by key
export async function getSetting(key: string): Promise<string | null> {
  const results = await query<SiteSetting>(
    'SELECT * FROM yar_site_settings WHERE setting_key = $1',
    [key]
  )
  return results.length > 0 ? results[0].setting_value : null
}

// Get multiple settings by keys
export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const results = await query<SiteSetting>(
    'SELECT * FROM yar_site_settings WHERE setting_key = ANY($1)',
    [keys]
  )
  const settings: Record<string, string | null> = {}
  keys.forEach(key => {
    settings[key] = null
  })
  results.forEach(setting => {
    settings[setting.setting_key] = setting.setting_value
  })
  return settings
}

// Get all settings
export async function getAllSettings(): Promise<SiteSetting[]> {
  return query<SiteSetting>('SELECT * FROM yar_site_settings ORDER BY setting_key')
}

// Set a setting value
export async function setSetting(key: string, value: string, type: string = 'text'): Promise<void> {
  await query(
    `INSERT INTO yar_site_settings (setting_key, setting_value, setting_type, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = NOW()`,
    [key, value, type]
  )
}

// Delete a setting
export async function deleteSetting(key: string): Promise<void> {
  await query('DELETE FROM yar_site_settings WHERE setting_key = $1', [key])
}

// Bulk set multiple settings
export async function setSettingsBatch(settings: {key: string, value: string, type: string}[]): Promise<void> {
  if (!settings.length) return;
  
  // Create a parameterized VALUES clause
  const values = [];
  const params = [];
  
  for (let i = 0; i < settings.length; i++) {
    const s = settings[i];
    const offset = i * 3;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, NOW())`);
    params.push(s.key, s.value, s.type || 'text');
  }
  
  await query(
    `INSERT INTO yar_site_settings (setting_key, setting_value, setting_type, updated_at)
     VALUES ${values.join(', ')}
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = EXCLUDED.setting_value, setting_type = EXCLUDED.setting_type, updated_at = NOW()`,
    params
  )
}

// Get all homepage sections
export async function getHomepageSections(): Promise<HomepageSection[]> {
  return query<HomepageSection>(
    'SELECT * FROM yar_homepage_sections WHERE is_visible = true ORDER BY display_order ASC'
  )
}

// Get a single homepage section
export async function getHomepageSection(id: string): Promise<HomepageSection | null> {
  const results = await query<HomepageSection>(
    'SELECT * FROM yar_homepage_sections WHERE id = $1',
    [id]
  )
  return results.length > 0 ? results[0] : null
}

// Create or update homepage section
export async function saveHomepageSection(section: Partial<HomepageSection> & { id?: string }): Promise<string> {
  if (section.id) {
    // Update existing
    await query(
      `UPDATE yar_homepage_sections 
       SET section_type = $1, title = $2, subtitle = $3, display_order = $4, 
           is_visible = $5, content_ids = $6, settings = $7, updated_at = NOW()
       WHERE id = $8`,
      [
        section.section_type,
        section.title,
        section.subtitle,
        section.display_order,
        section.is_visible,
        section.content_ids,
        JSON.stringify(section.settings || {}),
        section.id
      ]
    )
    return section.id
  } else {
    // Create new
    const results = await query<{ id: string }>(
      `INSERT INTO yar_homepage_sections 
       (section_type, title, subtitle, display_order, is_visible, content_ids, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        section.section_type,
        section.title,
        section.subtitle,
        section.display_order ?? 0,
        section.is_visible ?? true,
        section.content_ids || [],
        JSON.stringify(section.settings || {})
      ]
    )
    return results[0].id
  }
}

// Delete homepage section
export async function deleteHomepageSection(id: string): Promise<void> {
  await query('DELETE FROM yar_homepage_sections WHERE id = $1', [id])
}

// Get all homepage sections for admin (including hidden ones)
export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  return query<HomepageSection>(
    'SELECT * FROM yar_homepage_sections ORDER BY display_order ASC, created_at DESC'
  )
}
