const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS yar_store_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_item_id UUID REFERENCES yar_store_items(id) ON DELETE CASCADE,
        user_id UUID REFERENCES yar_users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Done!');
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
