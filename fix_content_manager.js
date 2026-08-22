const fs = require('fs');
let code = fs.readFileSync('components/admin/ContentManager.tsx', 'utf8');

const suggestedHtml = \
            <div>
              <label>???? ????<input value={form.category} onChange={(event) => setField('category', event.target.value)} placeholder="?????: ???? ?????? ????..." /></label>
              {form.content_type !== 'pdf' && form.content_type !== 'image' && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', alignSelf: 'center' }}>????????:</span>
                  {['???? ?????', '????? ??? ?/?', '????', '????'].map(cat => (
                    <button type="button" key={cat} onClick={() => setField('category', cat)} className="chip" style={{ cursor: 'pointer', background: form.category === cat ? 'var(--teal)' : 'var(--cream)', color: form.category === cat ? 'white' : 'inherit' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>\;

code = code.replace(
  "<label>???? ????<input value={form.category} onChange={(event) => setField('category', event.target.value)} placeholder=\"?????: ?????? ????...\" /></label>",
  suggestedHtml
);

fs.writeFileSync('components/admin/ContentManager.tsx', code);
