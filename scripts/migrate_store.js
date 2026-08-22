const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())
const { neon } = require('@neondatabase/serverless')

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('Altering yar_store_items...');
  await sql('ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;');
  await sql('ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;');
  console.log('Done!');
}

main().catch(console.error);
