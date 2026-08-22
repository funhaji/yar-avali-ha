const fs = require('fs');
let code = fs.readFileSync('components/admin/AdminSidebar.tsx', 'utf8');

code = code.replace(
  "{ href: '/admin/store', label: '???????', icon: BookOpen },",
  "{ href: '/admin/store', label: '???????', icon: BookOpen },\n  { href: '/admin/books', label: '???????', icon: BookOpen },"
);

fs.writeFileSync('components/admin/AdminSidebar.tsx', code);
