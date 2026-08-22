import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { requireAdmin } from '@/lib/teachers'
import { StoreItemForm } from '@/components/admin/StoreItemForm'

export default async function NewStoreItemPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const params = await searchParams
  const category = params.category || ''

  return (
    <div className="page fade-in">
      <SiteHeader userName={admin.name} isAdmin />
      <main className="shell section flex justify-center">
        <StoreItemForm defaultCategory={category} />
      </main>
    </div>
  )
}
