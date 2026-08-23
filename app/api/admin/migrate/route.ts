import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'

// Migration version tracking
const MIGRATIONS = [
  {
    version: 1,
    name: 'initial_site_settings',
    sql: `
      CREATE TABLE IF NOT EXISTS yar_site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  },
  {
    version: 2,
    name: 'homepage_sections',
    sql: `
      CREATE TABLE IF NOT EXISTS yar_homepage_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_type VARCHAR(50) NOT NULL,
        title TEXT,
        subtitle TEXT,
        display_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        content_ids TEXT[] DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  },
  {
    version: 3,
    name: 'migration_tracking',
    sql: `
      CREATE TABLE IF NOT EXISTS yar_migrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        version INTEGER UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `
  },
  {
    version: 4,
    name: 'support_chat_system',
    sql: `
      CREATE TABLE IF NOT EXISTS yar_support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        subject VARCHAR(500),
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_yar_support_tickets_user ON yar_support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_yar_support_tickets_status ON yar_support_tickets(status);
      
      CREATE TABLE IF NOT EXISTS yar_support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES yar_support_tickets(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_yar_support_messages_ticket ON yar_support_messages(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_yar_support_messages_user ON yar_support_messages(user_id);
    `
  },
  {
    version: 5,
    name: 'shop_and_inventory',
    sql: `
      CREATE TABLE IF NOT EXISTS yar_store_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price_cents INT NOT NULL,
        stock_quantity INT,
        is_digital BOOLEAN DEFAULT false,
        is_free BOOLEAN DEFAULT false,
        thumbnail_url VARCHAR(1000),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS images TEXT[];
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS discount_price_cents INT;
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS tags VARCHAR(255)[];
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT false;
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS file_url VARCHAR(1000);

      CREATE TABLE IF NOT EXISTS yar_cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        store_item_id UUID NOT NULL REFERENCES yar_store_items(id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, store_item_id)
      );
      CREATE INDEX IF NOT EXISTS idx_yar_cart_items_user ON yar_cart_items(user_id);

      CREATE TABLE IF NOT EXISTS yar_admin_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        link_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_yar_admin_notifications_read ON yar_admin_notifications(is_read);

      CREATE TABLE IF NOT EXISTS yar_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id),
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        shipping_address TEXT,
        total_cents INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_gateway_ref VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS yar_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES yar_orders(id) ON DELETE CASCADE,
        store_item_id UUID NOT NULL REFERENCES yar_store_items(id),
        quantity INT NOT NULL,
        price_cents INT NOT NULL
      );

      ALTER TABLE yar_orders ADD COLUMN IF NOT EXISTS notes TEXT;
    `
  },
  {
    version: 6,
    name: 'shop_customizations',
    sql: `
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
    `
  },
  {
    version: 7,
    name: 'shop_digital_content',
    sql: `
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS content_type VARCHAR(50);
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50);
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS pixeldrain_id VARCHAR(255);
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS gdrive_id VARCHAR(255);
      ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS r2_key VARCHAR(500);
    `
  },
  {
    version: 8,
    name: 'blog_additional_columns',
    sql: `
      ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS images TEXT[];
      ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000);
      ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS video_provider VARCHAR(50);
      ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS redirect_url VARCHAR(1000);
    `
  }
]

async function getAppliedMigrations(): Promise<number[]> {
  try {
    const results = await query<{ version: number }>(
      'SELECT version FROM yar_migrations ORDER BY version'
    )
    return results.map(r => r.version)
  } catch (error) {
    // Table doesn't exist yet
    return []
  }
}

async function applyMigration(migration: typeof MIGRATIONS[0]): Promise<void> {
  // Apply the migration SQL by splitting multiple statements
  const statements = migration.sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const statement of statements) {
    await query(statement)
  }
  
  // Record it (only if yar_migrations table exists)
  try {
    await query(
      'INSERT INTO yar_migrations (version, name) VALUES ($1, $2)',
      [migration.version, migration.name]
    )
  } catch (error) {
    // Ignore if table doesn't exist yet (will be created by migration 3)
  }
}

export async function POST(request: Request) {
  try {
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations()
    const pendingMigrations = MIGRATIONS.filter(m => !appliedMigrations.includes(m.version))

    if (pendingMigrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All migrations are up to date',
        applied: [],
        total: MIGRATIONS.length
      })
    }

    // Apply pending migrations
    const applied = []
    for (const migration of pendingMigrations) {
      await applyMigration(migration)
      applied.push({
        version: migration.version,
        name: migration.name
      })
    }

    return NextResponse.json({
      success: true,
      message: `Applied ${applied.length} migration(s)`,
      applied,
      total: MIGRATIONS.length
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Validate admin access
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations()
    const pendingMigrations = MIGRATIONS.filter(m => !appliedMigrations.includes(m.version))

    return NextResponse.json({
      total: MIGRATIONS.length,
      applied: appliedMigrations.length,
      pending: pendingMigrations.length,
      migrations: MIGRATIONS.map(m => ({
        version: m.version,
        name: m.name,
        status: appliedMigrations.includes(m.version) ? 'applied' : 'pending'
      }))
    })
  } catch (error) {
    console.error('Migration status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
