const fs = require('fs');
let code = fs.readFileSync('app/api/store/checkout/route.ts', 'utf8');

code = code.replace(
  "    const cart = await getCart(user.id)",
  \    const fullCart = await getCart(user.id)
    const body = await request.json()
    const { full_name, phone, shipping_address, notes, payment_method, postal_code, receipt_url, selected_item_ids } = body

    let cart = fullCart
    if (selected_item_ids && Array.isArray(selected_item_ids) && selected_item_ids.length > 0) {
      cart = fullCart.filter(item => selected_item_ids.includes(item.id))
    }\
);

code = code.replace(
  "    const body = await request.json()\n    const { full_name, phone, shipping_address, notes, payment_method, postal_code, receipt_url } = body",
  ""
);

code = code.replace(
  "    // 3. Clear cart\n    await clearCart(user.id)",
  \    // 3. Clear cart
    if (selected_item_ids && Array.isArray(selected_item_ids) && selected_item_ids.length > 0) {
      for (const item of cart) {
        await query('DELETE FROM yar_cart_items WHERE id =  AND user_id = ', [item.id, user.id])
      }
    } else {
      await clearCart(user.id)
    }\
);

fs.writeFileSync('app/api/store/checkout/route.ts', code);
