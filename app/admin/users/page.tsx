import { redirect } from 'next/navigation'
import { requireAnyRole } from '@/lib/auth'

export default async function AdminUsersPage() {
  try {
    await requireAnyRole(['administrator', 'editor'])
  } catch {
    redirect('/')
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Manage Users</h1>
      <p className="text-muted-foreground">Table of users with role/activation actions goes here.</p>
    </div>
  )
}
