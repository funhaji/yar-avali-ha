import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql("ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS specialty VARCHAR(255)");
  await sql("ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true");
  await sql("ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  console.log('Teacher columns added successfully!');
}
main();
