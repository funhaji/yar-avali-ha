const fs = require('fs');
let code = fs.readFileSync('app/api/admin/settings/upload/route.ts', 'utf8');

code = code.replace(
  "const blob = await put(\posters/\-\\, file, { access: 'public', addRandomSuffix: true })",
  \if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: '???? ????? ????? ???? ???. ???? BLOB_READ_WRITE_TOKEN ?? ????? ????.' }, { status: 503 })
  }
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const blob = await put(\\\posters/\\\-\\\\\\, file, { access: 'public', addRandomSuffix: true, token: process.env.BLOB_READ_WRITE_TOKEN })\
);

fs.writeFileSync('app/api/admin/settings/upload/route.ts', code);
