const fs = require('fs');
let code = fs.readFileSync('components/shop/CartDrawer.tsx', 'utf8');

// Replace imports
code = code.replace(
  "const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeFromCart, totalPrice, totalItems, isLoading } = useCart()",
  "const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeFromCart, totalPrice, totalItems, isLoading, selectedItemIds, toggleSelection, toggleAll, selectedTotalPrice } = useCart()"
);

// Replace the items.map loop with the one containing checkboxes
const oldItemsMap = \          ) : (
            items.map(item => {\;

const newItemsMap = \          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-line-soft">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-ink-soft">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-teal focus:ring-teal"
                    checked={selectedItemIds.length === items.length && items.length > 0}
                    onChange={toggleAll}
                  />
                  ?????? ??? ({items.length} ????)
                </label>
              </div>
              {items.map(item => {\;

code = code.replace(oldItemsMap, newItemsMap);

const oldItemDiv = \<div key={item.id} className="flex gap-4 p-3 border border-line-soft rounded-xl bg-cream/50 slide-up">\;
const newItemDiv = \const isSelected = selectedItemIds.includes(item.id)
                return (
                  <div key={item.id} className={\\\lex gap-3 p-3 border rounded-xl transition-colors slide-up \\\\}>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded text-teal focus:ring-teal cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </div>\;

code = code.replace(/return \(\s*<div key=\{item\.id\}.*?>/, newItemDiv);

const oldFooter = \        {items.length > 0 && !checkoutSuccess && !isLoading && (
          <div className="p-5 bg-cream border-t border-line-soft">
            <div className="flex items-center justify-between font-bold text-lg mb-4">
              <span>???? ??:</span>
              <span className="text-teal-deep">{totalPrice / 10} ?????</span>
            </div>
            <Link 
              href="/shop/checkout"
              onClick={() => setDrawerOpen(false)}
              className="button button-primary w-full justify-center button-lg shadow-lg hover:shadow-xl"
            >
              ????? ??? ????? ????\;

const newFooter = \        {items.length > 0 && !checkoutSuccess && !isLoading && (
          <div className="p-5 bg-cream border-t border-line-soft shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between font-bold text-lg mb-4">
              <span className="text-ink-soft">???? {selectedItemIds.length} ????:</span>
              <span className="text-teal-deep">{selectedTotalPrice / 10} ?????</span>
            </div>
            <Link 
              href="/shop/checkout"
              onClick={(e) => {
                if (selectedItemIds.length === 0) {
                  e.preventDefault()
                  alert('????? ????? ?? ???? ?? ???? ?????? ?????? ????.')
                  return
                }
                setDrawerOpen(false)
              }}
              className={\\\utton w-full justify-center button-lg shadow-lg transition-all \\\\}
            >
              ????? ??? ????? ????\;

// Actually the oldFooter might have utf8 garbled text in my terminal but in the file it is pure Persian.
// Since we are reading from the file system, the regex will work if we match the structure instead.

code = code.replace(/\{items\.length > 0 && !checkoutSuccess && !isLoading && \([\s\S]*?<\/Link>\s*<\/div>\s*\)\}/, \{items.length > 0 && !checkoutSuccess && !isLoading && (
          <div className="p-5 bg-cream border-t border-line-soft shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between font-bold text-lg mb-4">
              <span className="text-ink-soft">???? {selectedItemIds.length} ????:</span>
              <span className="text-teal-deep">{selectedTotalPrice / 10} ?????</span>
            </div>
            <Link 
              href="/shop/checkout"
              onClick={(e) => {
                if (selectedItemIds.length === 0) {
                  e.preventDefault()
                  alert('????? ????? ?? ???? ?? ???? ?????? ?????? ????.')
                  return
                }
                setDrawerOpen(false)
              }}
              className={\\\utton w-full justify-center button-lg shadow-lg transition-all \\\\}
            >
              ????? ??? ????? ????
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        )}\);

// Add the closing tag for the new fragment
code = code.replace(/}\s*\)\s*\)\}\s*<\/div>/, \}\n            )}\n            </>\n          )}\n        </div>\);

fs.writeFileSync('components/shop/CartDrawer.tsx', code);
