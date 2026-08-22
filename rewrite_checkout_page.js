const fs = require('fs');
let code = fs.readFileSync('app/shop/checkout/page.tsx', 'utf8');

// Replace imports and cart usage
code = code.replace(
  "  const { items, totalPrice, clearCart, isLoading: cartLoading } = useCart()",
  \  const { items: allItems, selectedItemIds, selectedTotalPrice, clearCart, removeFromCart, isLoading: cartLoading } = useCart()
  const items = allItems.filter(item => selectedItemIds.includes(item.id))
  const totalPrice = selectedTotalPrice\
);

code = code.replace(
  "        body: JSON.stringify({",
  \        body: JSON.stringify({
          selected_item_ids: selectedItemIds,\
);

code = code.replace(
  "        await clearCart()",
  \        for (const id of selectedItemIds) {
          await removeFromCart(id)
        }\
);

fs.writeFileSync('app/shop/checkout/page.tsx', code);
