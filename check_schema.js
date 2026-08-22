const {neon} = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
sql`SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'yar_store_items'`.then(console.log).catch(console.error);
