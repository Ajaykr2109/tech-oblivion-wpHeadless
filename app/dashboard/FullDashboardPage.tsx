import React, { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import DashboardClientShell from '@/components/dashboard/DashboardClientShell'

export default function DashboardFullPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="text-2xl font-semibold">Unified Dashboard</div>
      <Suspense fallback={<Card className="p-4">Loading…</Card>}>
        <DashboardClientShell />
      </Suspense>
    </div>
  )
}
