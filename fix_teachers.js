const fs = require('fs');
let code = fs.readFileSync('components/TeacherManager.tsx', 'utf8');

code = code.replace(
  "const d = await r.json(); setSaving(false)",
  "let d; try { d = await r.json(); } catch(e) { setSaving(false); return setError('???? ????: ' + r.statusText); }; setSaving(false)"
);

fs.writeFileSync('components/TeacherManager.tsx', code);
console.log('Fixed TeacherManager error handling');
