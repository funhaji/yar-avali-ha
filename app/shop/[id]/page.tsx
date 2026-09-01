import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getStoreItemById, getRelatedStoreItems, getStoreComments } from '@/lib/store'
import { ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Download, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { ProductCard } from '@/components/shop/ProductCard'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import { AddToCartButton } from './AddToCartButton'
import { icons } from 'lucide-react';
function DynamicIcon({ name, ...props }: { name: string, [key: string]: any }) {
  // @ts-ignore
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}
import { getEmbedUrl } from '@/lib/video'
import { StoreComments } from '@/components/shop/StoreComments'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getStoreItemById(id)
  
  if (!product) notFound()

  const hasDiscount = product.discount_price_cents !== null
  const price = hasDiscount ? product.discount_price_cents! : product.price_cents
  
  // Combine thumbnail and images
  const gallery = []
  if (product.thumbnail_url) gallery.push(product.thumbnail_url)
  if (product.images && product.images.length > 0) {
    gallery.push(...product.images)
  }

  const relatedItems = await getRelatedStoreItems(product.id, 3)
  const comments = await getStoreComments(product.id)

  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token).catch(() => null) : null
  const settings = await getSettings(['site_name', 'site_logo_url', 'contact_phone', 'contact_telegram_id'])

  return (
    <div className="page bg-cream">
      <SiteHeader 
        userName={user?.name} 
        isAdmin={user?.role === 'admin'} 
        siteName={settings.site_name || undefined}
        siteLogo={settings.site_logo_url || undefined}
      />
      
      <main className="shell py-8 md:py-12 flex-1">
        <Link href="/shop" className="inline-flex items-center gap-2 text-ink-soft hover:text-teal mb-6 font-bold slide-up">
          <ArrowRight className="w-5 h-5" /> بازگشت به فروشگاه
        </Link>
        
        <div className="card p-6 md:p-8 slide-up">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            {/* Gallery & Video */}
            <div className="w-full md:w-1/2 lg:w-5/12 shrink-0 flex flex-col gap-4">
              {product.video_url && (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg relative border-4 border-line-soft">
                  <iframe src={getEmbedUrl(product.video_url)} className="absolute inset-0 w-full h-full border-none" allowFullScreen allow="autoplay; fullscreen" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
                </div>
              )}
              <div className="aspect-square bg-paper border border-line-soft rounded-2xl overflow-hidden relative shadow-sm">
                {gallery.length > 0 ? (
                  <img src={gallery[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-soft opacity-30">
                    <ImageIcon className="w-24 h-24" />
                  </div>
                )}
                {product.is_digital && (
                  <div className="absolute top-4 right-4 badge bg-teal text-paper shadow-lg scale-in">
                    محصول دیجیتال
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {gallery.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-20 h-20 rounded-xl object-cover border border-line-soft shrink-0 snap-start" />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
              <div className="mb-2">
                <Link href={`/shop?category=${product.category}`} className="text-teal font-bold hover:underline">
                  {product.category || 'بدون دسته'}
                </Link>
              </div>
              
              <h1 className="display" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{product.title}</h1>
              
              <div className="flex items-center gap-4 text-sm font-bold text-ink-soft mb-6 pb-6 border-b border-line-soft">
                {/* Dynamic Badge 1 */}
                <span className="flex items-center gap-1.5">
                  <DynamicIcon name={settings?.product_badge_1_icon || 'ShieldCheck'} className="w-4 h-4 text-teal" /> 
                  {settings?.product_badge_1 || 'تضمین کیفیت'}
                </span>
                {product.is_downloadable && (
                  <span className="flex items-center gap-1.5">
                    <DynamicIcon name={settings?.product_badge_2_icon || 'Download'} className="w-4 h-4 text-teal" /> 
                    {settings?.product_badge_2 || 'دانلود فوری'}
                  </span>
                )}
                {/* Dynamic Badge 3 */}
                <span className="flex items-center gap-1.5">
                  <DynamicIcon name={settings?.product_badge_3_icon || 'CheckCircle2'} className="w-4 h-4 text-teal" /> 
                  {product.stock_quantity === 0 && !product.is_digital 
                    ? <span className="text-berry">{settings?.product_badge_3_outstock || 'تمام شده'}</span> 
                    : (settings?.product_badge_3_instock || 'موجوده')}
                </span>
              </div>
              
              <div className="prose prose-slate rtl text-ink/90 leading-relaxed mb-8 max-w-none whitespace-pre-wrap">
                {product.description || 'هنوز توضیحی برای این محصول نوشته نشده.'}
                {/* Banner for Books category */}
                {product.category === 'کتاب' && (
                  <div className="bg-teal/10 border border-teal text-teal p-4 rounded-xl mb-8 font-medium">
                    برای ثبت سفارش با آیدی زیر یا شماره زیر مراجعه کنید:
                    <br />
                    آیدی تلگرام: <span dir="ltr">{settings.contact_telegram_id || '@yar_avali_ha'}</span>
                    <br />
                    تلفن: <span dir="ltr">{settings.contact_phone || '09120000000'}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-6 border-t border-line-soft flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                {product.price_cents === null ? (
                  <div className="w-full">
                    {product.file_url ? (
                      <a href={product.file_url.startsWith('http') ? product.file_url : 'https://' + product.file_url} target="_blank" rel="noopener noreferrer" className="button button-primary w-full sm:w-auto justify-center button-lg">
                        مشاهده و دانلود
                      </a>
                    ) : (
                      <div className="text-ink-soft text-lg font-bold">جهت معرفی</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      {hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-ink-soft line-through mb-1">{product.price_cents / 10} تومان</span>
                          <span className="font-bold text-teal-deep text-3xl">{price / 10} تومان</span>
                        </div>
                      ) : (
                        <span className="font-bold text-ink text-3xl">{product.is_free ? 'رایگان' : (price / 10) + ' تومان'}</span>
                      )}
                    </div>
                    
                    <AddToCartButton product={product} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 max-w-4xl slide-up" style={{ animationDelay: '0.1s' }}>
          <StoreComments storeItemId={product.id} initialComments={comments} user={user} />
        </div>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <div className="mt-12 slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-bold text-2xl mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-teal" /> شاید اینا رو هم دوست داشته باشی
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((item, i) => (
                <div key={item.id} className={`stagger-${i + 1}`}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <SiteFooter />
    </div>
  )
}


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { getStoreItemById } = require('@/lib/store');
  const product = await getStoreItemById(id);
  if (!product) return {};
  const url = 'https://www.yaravaliha.ir/shop/' + id;
  return {
    title: product.title,
    description: product.description?.substring(0, 160) || 'خرید ' + product.title,
    openGraph: {
      title: product.title,
      description: product.description?.substring(0, 160) || 'خرید ' + product.title,
      url,
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
    }
  }
}
