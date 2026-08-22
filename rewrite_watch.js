const fs = require('fs');
let code = fs.readFileSync('app/watch/[id]/page.tsx', 'utf8');

// Replace dark theme with light theme
code = code.replace(
  '<div className="page bg-ink text-paper" style={{ minHeight: \'100vh\' }}>',
  '<div className="page bg-cream text-ink" style={{ minHeight: \'100vh\' }}>'
);

code = code.replace(
  /className="border-b border-white\/10 bg-ink\/90 backdrop-blur-md sticky top-0 z-50"/g,
  'className="border-b border-line-soft bg-paper/90 backdrop-blur-md sticky top-0 z-50"'
);

code = code.replace(
  /text-paper\/80 hover:text-paper/g,
  'text-ink-soft hover:text-ink'
);

code = code.replace(
  /bg-white\/5 px-4 py-1\.5 rounded-full border border-white\/10/g,
  'bg-cream px-4 py-1.5 rounded-full border border-line-soft'
);

// Modify main layout containers
code = code.replace(
  /bg-black\/40 border-b border-white\/10/g,
  'bg-paper border-b border-line-soft'
);
code = code.replace(
  /bg-ink border-b border-white\/10/g,
  'bg-paper border-b border-line-soft'
);

// Tags
code = code.replace(/bg-white\/10 text-paper\/90/g, 'bg-cream text-ink font-bold');
code = code.replace(/border-white\/10/g, 'border-line-soft');
code = code.replace(/bg-white\/5/g, 'bg-cream');
code = code.replace(/text-paper\/80/g, 'text-ink-soft');
code = code.replace(/text-paper\/70/g, 'text-ink-soft');
code = code.replace(/text-paper\/60/g, 'text-ink-soft');
code = code.replace(/text-paper\/30/g, 'text-ink-soft opacity-50');

fs.writeFileSync('app/watch/[id]/page.tsx', code);
