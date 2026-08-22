import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Altering yar_store_items table...");
    await sql`ALTER TABLE yar_store_items ALTER COLUMN price_cents DROP NOT NULL`;
    console.log("Success! price_cents can now be null.");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
