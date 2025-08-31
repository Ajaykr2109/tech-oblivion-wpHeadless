import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminMediaPage() {
  await requireAccess({ path: '/api/wp/media', method: 'POST', action: 'write' })
  return (
    <div className="p-8">
      <PageHeader title="media" subtitle="Upload / Update / Delete" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Media manager UI coming soon (wired to /api/wp/media).*</div>
    </div>
  )
}
