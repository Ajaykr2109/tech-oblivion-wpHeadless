import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export default async function AdminDebugPage() {
  await requireAccess({ path: '/api/_debug', method: 'GET', action: 'read' })
  return (
    <div className="p-8">
      <PageHeader title="debug / test" subtitle="Internal dev only" />
      <div className="p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">Diagnostics for admins only (wired to /api/_debug and /api/test).</div>
    </div>
  )
}
