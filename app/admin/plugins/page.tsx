import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminPluginsPage() {
  await requireAccess({ path: '/api/wp/plugins', method: 'GET', action: 'read' })
  return (
    <div className="p-8">
      <PageHeader title="plugins" subtitle="Activate / Deactivate" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Plugins list and toggles coming soon (wired to /api/wp/plugins).</div>
    </div>
  )
}
