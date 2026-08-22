const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');

async function migrate() {
  console.log("Starting DB Migration...");
  
  try {
    // 1. Blog Categories
    console.log("Adding category to yar_blog_posts...");
    await sql`ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS category VARCHAR(100);`;
    
    // 2. Teachers Video
    console.log("Adding video_url to yar_teachers...");
    await sql`ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS video_url TEXT;`;
    
    // 3. Store Items Video
    console.log("Adding video_url to yar_store_items...");
    await sql`ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS video_url TEXT;`;
    
    // 4. Gallery Table
    console.log("Creating yar_gallery table...");
    await sql`
      CREATE TABLE IF NOT EXISTS yar_gallery (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255),
        image_url VARCHAR(1024) NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
