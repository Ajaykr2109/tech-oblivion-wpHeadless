import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminTagsPage() {
  await requireAccess({ path: '/api/wp/tags', method: 'POST', action: 'write' })
  return (
    <div className="p-8">
      <PageHeader title="tags" subtitle="Create / Read / Update / Delete" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Tags management UI coming soon (wired to /api/wp/tags).</div>
    </div>
  )
}
