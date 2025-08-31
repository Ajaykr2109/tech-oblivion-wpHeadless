import { Suspense } from 'react'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

export const runtime = 'nodejs'

export default async function Page() {
  await requireAccess({ path: '/api/analytics/summary', method: 'GET', action: 'read' })
  return (
    <div className="container mx-auto p-4">
      <PageHeader title="analytics" />
      <Suspense fallback={<div>Loading…</div>}>
        {/* Server component hosts client subcomponents */}
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}
