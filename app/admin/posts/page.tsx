import { redirect } from 'next/navigation'
import { requireAnyRole } from '@/lib/auth'

export default async function AdminPostsPage() {
  try {
    await requireAnyRole(['administrator', 'editor'])
  } catch {
    redirect('/')
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Manage Posts</h1>
      <p className="text-muted-foreground">Table with filters and bulk actions goes here.</p>
    </div>
  )
}
