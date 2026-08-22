const fs = require('fs');
let f = fs.readFileSync('lib/store.ts', 'utf8');
f = f.replaceAll("'thumbnail_url', 'images', 'category', 'tags', 'file_url'", "'thumbnail_url', 'video_url', 'images', 'category', 'tags', 'file_url'");
fs.writeFileSync('lib/store.ts', f);
