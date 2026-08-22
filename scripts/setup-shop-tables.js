const { neon } = require('@neondatabase/serverless');

async function setupShopDatabase() {
  console.log('🔧 Setting up shop database tables...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const sql = neon(dbUrl);
  
  try {
    console.log('📋 Updating store_items table...');
    await sql`ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS images TEXT[]`;
    await sql`ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS discount_price_cents INT`;
    await sql`ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS tags VARCHAR(255)[]`;
    await sql`ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS file_url VARCHAR(1000)`;
    console.log('✓ yar_store_items updated');

    console.log('📋 Creating cart items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS yar_cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        store_item_id UUID NOT NULL REFERENCES yar_store_items(id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_item_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_cart_items_user ON yar_cart_items(user_id)`;
    console.log('✓ yar_cart_items created');

    console.log('📋 Creating admin notifications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS yar_admin_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        link_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_admin_notifications_read ON yar_admin_notifications(is_read)`;
    console.log('✓ yar_admin_notifications created');

    console.log('📋 Updating orders table with more details...');
    await sql`ALTER TABLE yar_orders ADD COLUMN IF NOT EXISTS notes TEXT`;
    
    console.log('\n✅ Shop database setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Error setting up shop database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupShopDatabase();
