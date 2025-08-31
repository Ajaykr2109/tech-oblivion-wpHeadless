import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminSiteHealthPage() {
  await requireAccess({ path: '/api/wp/site-health/background-updates', method: 'GET', action: 'read' })
  return (
    <div className="p-8">
      <PageHeader title="site health" subtitle="Background updates / Directory sizes" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Site Health widgets coming soon (wired to /api/wp/site-health/*).</div>
    </div>
  )
}
