import AdminDashboard from '@/components/admin/AdminDashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function Page() { return <AdminDashboard sectionKey="posts" /> }
