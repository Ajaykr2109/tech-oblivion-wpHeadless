import { redirect } from 'next/navigation'
import { requireAnyRole } from '@/lib/auth'
import { Input } from '@/components/ui/input'

export default async function AdminUsersPage() {
  try {
    await requireAnyRole(['administrator', 'editor'])
  } catch {
    redirect('/')
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="mb-4">
        <Input placeholder="Search users by name or email..." />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 bg-card/80">
          <p className="text-muted-foreground">A table of users with role management, activation status, and actions (edit, delete) will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}
