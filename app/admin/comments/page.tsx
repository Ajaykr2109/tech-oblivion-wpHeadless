import { redirect } from 'next/navigation'
import { requireAnyRole } from '@/lib/auth'

export default async function AdminCommentsPage() {
  try {
    await requireAnyRole(['administrator', 'editor'])
  } catch {
    redirect('/')
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Comments Moderation</h1>
      <p className="text-muted-foreground">Approve/Reject/Delete queue goes here.</p>
    </div>
  )
}
