import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { requireAdmin } from '@/lib/teachers'
import { getUniqueCategories as getStoreCats, getUniqueSubcategories as getStoreSubCats } from '@/lib/store'
import { query } from '@/lib/db'
import { getSettings } from '@/lib/settings'
import { CategoryOrderClient } from '@/components/admin/CategoryOrderClient'

export default async function CategoriesAdminPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  // Fetch unique store categories and their subcategories
  const storeCats = await getStoreCats()
  const storeData: any = { categories: storeCats, subcategories: {} }
  for (const cat of storeCats) {
    storeData.subcategories[cat] = await getStoreSubCats(cat)
  }

  // Fetch unique blog categories and their subcategories
  const blogCatsQuery = await query<{ category: string }>('SELECT DISTINCT category FROM yar_blog_posts WHERE category IS NOT NULL AND category != \'\'')
  const blogCats = blogCatsQuery.map(r => r.category)
  const blogData: any = { categories: blogCats, subcategories: {} }
  for (const cat of blogCats) {
    const subQuery = await query<{ subcategory: string }>('SELECT DISTINCT subcategory FROM yar_blog_posts WHERE category = $1 AND subcategory IS NOT NULL AND subcategory != \'\'', [cat])
    blogData.subcategories[cat] = subQuery.map(r => r.subcategory)
  }

  const settings = await getSettings(['shop_cat_order', 'shop_subcat_order', 'blog_cat_order', 'blog_subcat_order'])

  let initialShopOrder = { categories: [], subcategories: {} }
  let initialBlogOrder = { categories: [], subcategories: {} }
  
  try { if (settings.shop_cat_order) initialShopOrder.categories = JSON.parse(settings.shop_cat_order) } catch(e){}
  try { if (settings.shop_subcat_order) initialShopOrder.subcategories = JSON.parse(settings.shop_subcat_order) } catch(e){}
  try { if (settings.blog_cat_order) initialBlogOrder.categories = JSON.parse(settings.blog_cat_order) } catch(e){}
  try { if (settings.blog_subcat_order) initialBlogOrder.subcategories = JSON.parse(settings.blog_subcat_order) } catch(e){}

  // Merge the DB discovered items with the saved sort order
  // so new items that aren't in the saved order still show up at the bottom
  const mergeOrder = (dbItems: string[], savedOrder: string[]) => {
    const order = [...savedOrder]
    for (const item of dbItems) {
      if (!order.includes(item)) order.push(item)
    }
    return order.filter(item => dbItems.includes(item)) // remove deleted items
  }

  const shopOrder = {
    categories: mergeOrder(storeData.categories, initialShopOrder.categories),
    subcategories: {}
  }
  for (const cat of shopOrder.categories) {
    shopOrder.subcategories[cat] = mergeOrder(storeData.subcategories[cat] || [], (initialShopOrder.subcategories as any)[cat] || [])
  }

  const blogOrder = {
    categories: mergeOrder(blogData.categories, initialBlogOrder.categories),
    subcategories: {}
  }
  for (const cat of blogOrder.categories) {
    blogOrder.subcategories[cat] = mergeOrder(blogData.subcategories[cat] || [], (initialBlogOrder.subcategories as any)[cat] || [])
  }

  return (
    <div className="page">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section" style={{ maxWidth: '800px' }}>
        <h1 className="section-title mb-6">ترتیب نمایش دسته‌بندی‌ها</h1>
        <p className="muted mb-8">در این بخش می‌توانید ترتیب نمایش دسته‌ها و زیردسته‌ها را در صفحات فروشگاه و وبلاگ تغییر دهید.</p>
        
        <CategoryOrderClient 
          initialShopOrder={shopOrder}
          initialBlogOrder={blogOrder}
        />
      </main>
    </div>
  )
}
