const fs = require('fs');
let code = fs.readFileSync('app/api/admin/teachers/route.ts', 'utf8');

code = code.replace(
  \  try { const rows = await query(
    'INSERT INTO yar_teachers (name, specialty, bio, photo_url, display_order, is_visible) VALUES (\,\,\,\,\,\) RETURNING *',
    [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true]
  )
  revalidateTag('teachers')
  return NextResponse.json({ teacher: rows[0] })
}\,
  \  try {
    const rows = await query(
      'INSERT INTO yar_teachers (name, specialty, bio, photo_url, display_order, is_visible) VALUES (\,\,\,\,\,\) RETURNING *',
      [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true]
    )
    revalidateTag('teachers')
    return NextResponse.json({ teacher: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}\
);

code = code.replace(
  \  const rows = await query(
    'UPDATE yar_teachers SET name=\, specialty=\, bio=\, photo_url=\, display_order=\, is_visible=\, updated_at=NOW() WHERE id=\ RETURNING *',
    [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, id]
  )
  revalidateTag('teachers')
  return NextResponse.json({ teacher: rows[0] })
}\,
  \  try {
    const rows = await query(
      'UPDATE yar_teachers SET name=\, specialty=\, bio=\, photo_url=\, display_order=\, is_visible=\, updated_at=NOW() WHERE id=\ RETURNING *',
      [name, specialty || null, bio || null, photo_url || null, display_order || 0, is_visible ?? true, id]
    )
    revalidateTag('teachers')
    return NextResponse.json({ teacher: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}\
);

fs.writeFileSync('app/api/admin/teachers/route.ts', code);
