const fs = require('fs');

let code = fs.readFileSync('components/admin/StoreItemForm.tsx', 'utf8');

// Fix defaultCategory
code = code.replace(
  'defaultValue={initialData?.category || \\'\\'}',
  'defaultValue={initialData?.category || defaultCategory || \\'\\'}'
);

// Fix parse price
code = code.replace(
  "const priceCents = parseInt(formData.get('price_cents') as string) * 10",
  "const priceCents = isShowcase ? null : (parseInt(formData.get('price_cents') as string) * 10 || 0)"
);

// Conditionally render price fields
code = code.replace(
  '<div className="grid md:grid-cols-3 gap-6 p-4 bg-cream rounded-xl">\\r\\n          <div>\\r\\n            <label>???? (?????) *\\r\\n              <input type="number" name="price_cents" required defaultValue={initialData ? initialData.price_cents / 10 : \\'\\'} min="0" />\\r\\n            </label>\\r\\n          </div>\\r\\n          <div>\\r\\n            <label>???? ?? ????? (?????)\\r\\n              <input type="number" name="discount_price_cents" defaultValue={initialData?.discount_price_cents ? initialData.discount_price_cents / 10 : \\'\\'} min="0" />\\r\\n            </label>\\r\\n            <small className="text-ink-soft">??? ???? ????? ????? ???? ??????</small>\\r\\n          </div>\\r\\n          <div>\\r\\n            <label>?????? ?????\\r\\n              <input type="number" name="stock_quantity" defaultValue={initialData?.stock_quantity || \\'\\'} min="0" disabled={isDigital} />\\r\\n            </label>\\r\\n            <small className="text-ink-soft">???? ??????? ??????? ?????? ????? ??????</small>\\r\\n          </div>\\r\\n        </div>',
  \<div className="flex flex-col gap-4 p-4 bg-cream rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer p-2 border border-line-soft rounded-lg bg-white">
            <input type="checkbox" checked={isShowcase} onChange={e => setIsShowcase(e.target.checked)} className="w-5 h-5 accent-teal" />
            <span className="font-bold">??? ????? (??????? ????)</span>
            <small className="text-ink-soft">?? ?????? ??? ?????? ??? ????? ???? ??? ????? ????? ???? ?????? ? ???? ???? ?????? ????.</small>
          </label>
          
          {!isShowcase && (
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label>???? (?????) *
                  <input type="number" name="price_cents" required defaultValue={initialData ? initialData.price_cents / 10 : ''} min="0" />
                </label>
              </div>
              <div>
                <label>???? ?? ????? (?????)
                  <input type="number" name="discount_price_cents" defaultValue={initialData?.discount_price_cents ? initialData.discount_price_cents / 10 : ''} min="0" />
                </label>
                <small className="text-ink-soft">??? ???? ????? ????? ???? ??????</small>
              </div>
              <div>
                <label>?????? ?????
                  <input type="number" name="stock_quantity" defaultValue={initialData?.stock_quantity || ''} min="0" disabled={isDigital} />
                </label>
                <small className="text-ink-soft">???? ??????? ?????? ????? ??????</small>
              </div>
            </div>
          )}
        </div>\
);

fs.writeFileSync('components/admin/StoreItemForm.tsx', code);
