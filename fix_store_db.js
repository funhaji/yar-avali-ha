const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon("postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
  
  try {
    console.log('Altering yar_store_items table...');
    await sql\ALTER TABLE yar_store_items ALTER COLUMN price_cents DROP NOT NULL\;
    console.log('Success! price_cents can now be null.');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
