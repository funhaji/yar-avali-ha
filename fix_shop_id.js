const fs = require('fs');

let code = fs.readFileSync('app/shop/[id]/page.tsx', 'utf8');

const replacement = \
              <div className="mt-auto pt-6 border-t border-line-soft flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                {product.price_cents === null ? (
                  <div className="w-full">
                    {/* Showcase only */}
                    {product.file_url ? (
                      <a href={product.file_url.startsWith('http') ? product.file_url : 'https://' + product.file_url} target="_blank" rel="noopener noreferrer" className="button button-primary w-full sm:w-auto justify-center button-lg">
                        ?????? ? ??????
                      </a>
                    ) : (
                      <div className="text-ink-soft text-lg font-bold">??? ?????</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      {hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-ink-soft line-through mb-1">{product.price_cents / 10} ?????</span>
                          <span className="font-bold text-teal-deep text-3xl">{price / 10} ?????</span>
                        </div>
                      ) : (
                        <span className="font-bold text-ink text-3xl">{price / 10} ?????</span>
                      )}
                    </div>
                    
                    <AddToCartButton product={product} />
                  </>
                )}
              </div>
\;

code = code.replace(
  /<div className="mt-auto pt-6 border-t border-line-soft flex flex-col sm:flex-row gap-6 sm:items-center justify-between">[\\s\\S]*?<AddToCartButton product=\\{product\\} \\/>\\s*<\\/div>/m,
  replacement.trim()
);

fs.writeFileSync('app/shop/[id]/page.tsx', code);
