export const revalidate = 120

import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { SiteHeader, SiteFooter } from '@/components/SiteHeader'
import { getStoreItemById, getRelatedStoreItems, getStoreComments } from '@/lib/store'
import { validateSession } from '@/lib/auth'
import { ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Download, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductImageGallery } from '@/components/shop/ProductImageGallery'
import Link from 'next/link'
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
  const token = (await cookies()).get('session_token')?.value
  const user = token ? await validateSession(token) : null

  const product = await getStoreItemById(id)
  
  if (!product) notFound()

  const hasDiscount = product.discount_price_cents !== null
  const price = hasDiscount ? product.discount_price_cents! : product.price_cents
  
  // Combine thumbnail and gallery images with robust parsing
  const allImages: string[] = []
  if (product.thumbnail_url) allImages.push(product.thumbnail_url)
  if (Array.isArray(product.images)) {
    allImages.push(...product.images)
  } else if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images)
      if (Array.isArray(parsed)) allImages.push(...parsed)
      else allImages.push(...(product.images as string).replace(/[{}]/g, '').split(','))
    } catch {
      allImages.push(...(product.images as string).replace(/[{}]/g, '').split(','))
    }
  }
  const gallery = Array.from(new Set(allImages.map(s => (s || '').trim()).filter(Boolean)))

  const relatedItems = await getRelatedStoreItems(product.id, 3)
  const comments = await getStoreComments(product.id)
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
              <ProductImageGallery 
                images={gallery} 
                title={product.title} 
                isDigital={product.is_digital} 
              />
            </div>
            
            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {product.category && (
                    <span className="badge badge-accent">{product.category}</span>
                  )}
                  {product.subcategory && (
                    <span className="badge bg-cream border border-line-soft text-ink-soft">{product.subcategory}</span>
                  )}
                  {product.is_digital ? (
                    <span className="badge bg-purple-100 text-purple-700 border-purple-200">فایل دیجیتال (دانلود فوری)</span>
                  ) : (
                    <span className="badge bg-teal/10 text-teal-deep border-teal/20">محصول فیزیکی (ارسال پستی)</span>
                  )}
                </div>
                
                <h1 className="display mb-4" style={{ fontSize: '2rem' }}>{product.title}</h1>
                
                {product.description && (
                  <div className="text-ink-soft leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base">
                    {product.description}
                  </div>
                )}
                
                {product.category === 'کتاب' && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-sm text-amber-900 leading-relaxed font-medium">
                    برای ثبت سفارش یا مشاوره خرید کتاب می‌توانید با شماره <span className="font-bold font-mono">{settings.contact_phone || '۰۹۳۶۰۰۰۰۰۰۰'}</span> یا آیدی تلگرام <span className="font-bold font-mono" dir="ltr">{settings.contact_telegram_id || '@yaravaliha'}</span> ارتباط برقرار کنید.
                  </div>
                )}
                
                <div className="space-y-3 mb-8">
                  {product.is_digital ? (
                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                      <Download className="w-4 h-4 text-teal" />
                      <span>دسترسی آنی به فایل پس از پرداخت</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                      <ShieldCheck className="w-4 h-4 text-teal" />
                      <span>ضمانت اصالت و سلامت فیزیکی کالا</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    <CheckCircle2 className="w-4 h-4 text-teal" />
                    <span>پشتیبانی تخصصی آموزشی</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-line-soft pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {product.category === 'کتاب' ? (
                  <div className="w-full text-center">
                    <span className="inline-block bg-teal/10 text-teal-deep font-bold px-4 py-2 rounded-xl text-sm">
                      سفارش از طریق راه‌های ارتباطی درج شده در بالا
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xs text-ink-soft mb-1">قیمت نهایی:</span>
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-teal-deep text-3xl">{(price / 10).toLocaleString()} تومان</span>
                          <span className="text-ink-soft line-through text-lg">{((product.price_cents || 0) / 10).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-ink text-3xl">{product.is_free ? 'رایگان' : (price / 10).toLocaleString() + ' تومان'}</span>
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
