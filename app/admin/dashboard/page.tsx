import { Suspense } from 'react'
import UnifiedAdmin from '@/components/admin/UnifiedAdmin'

export const runtime = 'nodejs'

export default async function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <Suspense fallback={<div>Loading…</div>}>
        <UnifiedAdmin />
      </Suspense>
    </div>
  )
}
