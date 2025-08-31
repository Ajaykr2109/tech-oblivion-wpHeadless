import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminCategoriesPage() {
  await requireAccess({ path: '/api/wp/categories', method: 'POST', action: 'write' })
  return (
    <div className="p-8">
      <PageHeader title="categories" subtitle="Create / Read / Update / Delete" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Categories management UI coming soon (wired to /api/wp/categories).</div>
    </div>
  )
}
