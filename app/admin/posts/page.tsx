import { redirect } from 'next/navigation'
import { requireAnyRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function AdminPostsPage() {
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Posts</h1>
        <Button asChild>
          <Link href="/editor/new">New Post</Link>
        </Button>
      </div>
      <div className="mb-4">
        <Input placeholder="Search posts..." />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 bg-card/80">
          <p className="text-muted-foreground">A table with filters, bulk actions (publish, unpublish, delete), and links to edit each post will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}
