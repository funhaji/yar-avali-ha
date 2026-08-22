// Script to test POST to /api/admin/store
const http = require('http');

const payload = JSON.stringify({
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
  tags: "",
  content_type: null,
  storage_provider: null,
  pixeldrain_id: null,
  gdrive_id: null,
  r2_key: null,
  file_url: null
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/store',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
