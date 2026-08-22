require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('No DATABASE_URL');
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    await sql\ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS specialty VARCHAR(255)\;
    await sql\ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true\;
    await sql\ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\;
    console.log('Teacher columns added successfully!');
  } catch(e) {
    console.error(e);
  }
}
main();
