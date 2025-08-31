import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminThemesPage() {
  await requireAccess({ path: '/api/wp/themes', method: 'GET', action: 'read' })
  return (
    <div className="p-8">
      <PageHeader title="themes" subtitle="Activate" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Themes list coming soon (wired to /api/wp/themes).</div>
    </div>
  )
}
