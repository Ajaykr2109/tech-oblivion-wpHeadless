
import { Suspense } from 'react'
import UnifiedAdmin from '@/components/admin/UnifiedAdmin'
import PageHeader from '@/components/admin/PageHeader'

export const runtime = 'nodejs'

export default function AdminHomePage() {
  return (
    <div className="p-8">
      <PageHeader title="admin dashboard" />
      <Suspense fallback={<div>Loading…</div>}>
        <UnifiedAdmin />
      </Suspense>
    </div>
  )
}
