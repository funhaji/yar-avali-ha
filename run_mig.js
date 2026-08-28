const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_laTcdA869YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    await client.connect();
    await client.query(`ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
    await client.query(`ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS images TEXT[];`);
    await client.query(`ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000);`);
    await client.query(`ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS video_provider VARCHAR(50);`);
    await client.query(`ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS redirect_url VARCHAR(1000);`);
    console.log("Migration complete!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();