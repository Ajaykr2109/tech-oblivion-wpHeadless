import AdminDashboard from '@/components/admin/AdminDashboard'

export const runtime = 'nodejs'

export default async function Page() {
  return <AdminDashboard sectionKey="dashboard" />
}
