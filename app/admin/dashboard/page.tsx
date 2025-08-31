import { Suspense } from 'react'
import UnifiedAdmin from '@/components/admin/UnifiedAdmin'
import Link from 'next/link'

export const runtime = 'nodejs'

export default async function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="mb-4 text-sm text-muted-foreground">
        Looking for the new unified, draggable dashboard? See <Link className="underline" href="/dashboard/full">Dashboard Full</Link>.
      </div>
      <Suspense fallback={<div>Loading…</div>}>
        <UnifiedAdmin />
      </Suspense>
    </div>
  )
}
