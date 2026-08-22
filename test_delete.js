const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
sql`DELETE FROM yar_store_items WHERE id = '437c92df-0668-4b92-83e4-add9cdfdf44c'`.then(console.log).catch(console.error);
