import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { requireAdmin } from '@/lib/teachers'
import { StoreItemForm } from '@/components/admin/StoreItemForm'
import { getStoreItemById, getUniqueCategories, getUniqueSubcategories } from '@/lib/store'

export default async function EditStoreItemPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const { id } = await params
  const item = await getStoreItemById(id)

  if (!item) {
    redirect('/admin/store')
  }

  const categories = await getUniqueCategories()
  const subcategories = await getUniqueSubcategories()

  return (
    <div className="page fade-in">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section flex justify-center">
        <StoreItemForm 
          initialData={item} 
          existingCategories={categories}
          existingSubcategories={subcategories}
        />
      </main>
    </div>
  )
}
