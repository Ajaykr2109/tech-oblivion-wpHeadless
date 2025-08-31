
import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  await requireAccess({ path: '/api/wp/users', method: 'GET', action: 'read' })
  return (
    <div className="p-8">
      <PageHeader title="users" subtitle="Update / Delete" />
      <UsersClient />
    </div>
  )
}
