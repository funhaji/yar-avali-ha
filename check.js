const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require' });
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT constraint_name, table_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'yar_video_comments';");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
