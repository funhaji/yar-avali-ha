const fs = require('fs');
let code = fs.readFileSync('app/books/page.tsx', 'utf8');

code = code.replace(
  "</p>\n          </div>",
  "</p>\n          </div>\n\n          {user?.role === 'admin' && (\n            <div className=\"flex justify-center mb-8\">\n              <Link href=\"/admin/store/new?category=????\" className=\"button button-primary\">\n                + ?????? ???? ????\n              </Link>\n            </div>\n          )}"
);

fs.writeFileSync('app/books/page.tsx', code);
