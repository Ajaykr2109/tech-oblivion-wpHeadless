import { Suspense } from 'react'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const runtime = 'nodejs'

export default async function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Analytics Dashboard</h1>
      <Suspense fallback={<div>Loading…</div>}>
        {/* Server component hosts client subcomponents */}
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}
