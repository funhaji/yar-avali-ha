const fs = require('fs'); const code = require('./new_code.json'); fs.writeFileSync('app/shop/checkout/page.tsx', code.code);
