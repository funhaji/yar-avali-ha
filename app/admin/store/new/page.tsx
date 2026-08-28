import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { requireAdmin } from '@/lib/teachers'
import { StoreItemForm } from '@/components/admin/StoreItemForm'
import { getUniqueCategories, getUniqueSubcategories } from '@/lib/store'

export default async function NewStoreItemPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const params = await searchParams
  const category = params.category || ''

  const categories = await getUniqueCategories()
  const subcategories = await getUniqueSubcategories()

  return (
    <div className="page fade-in">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section flex justify-center">
        <StoreItemForm 
          defaultCategory={category} 
          existingCategories={categories}
          existingSubcategories={subcategories}
        />
      </main>
    </div>
  )
}
