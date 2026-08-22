require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_laTcdA89YjWH@ep-round-salad-ang9x0xj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");

async function createStoreItem(data) {
  const fields = [
    'title', 'description', 'price_cents', 'discount_price_cents', 
    'stock_quantity', 'is_digital', 'is_free', 'is_downloadable', 
    'is_published', 'display_order',
    'content_type', 'storage_provider', 'pixeldrain_id', 'gdrive_id', 'r2_key',
    'thumbnail_url', 'images', 'category', 'tags', 'file_url'
  ];
  
  const values = [];
  const placeholders = [];
  const insertFields = [];

  let index = 1;
  for (const field of fields) {
    if (data[field] !== undefined) {
      insertFields.push(field);
      values.push(data[field]);
      placeholders.push('$' + index);
      index++;
    }
  }

  const query = \
    INSERT INTO yar_store_items (\)
    VALUES (\)
    RETURNING *
  \;
  console.log("Query:", query);
  console.log("Values:", values);
  try {
    const res = await sql(query, values);
    console.log("Success:", res[0]);
  } catch(e) {
    console.error("DB Error:", e.message);
  }
}

createStoreItem({
  title: "Test Book",
  description: "Test description",
  price_cents: null,
  discount_price_cents: null,
  stock_quantity: null,
  is_digital: false,
  is_free: true,
  is_downloadable: false,
  is_published: true,
  display_order: 0,
  thumbnail_url: null,
  images: [],
  category: "????",
  tags: [],
  content_type: null,
  storage_provider: null,
  pixeldrain_id: null,
  gdrive_id: null,
  r2_key: null,
  file_url: null
});
