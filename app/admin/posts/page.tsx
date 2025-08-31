
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'

const dummyAdminPosts = [
  { id: 1, title: "The Future of AI in Web Development", status: "Published", author: "Jane Doe", date: "2024-07-28" },
  { id: 2, title: "A Deep Dive into React Server Components", status: "Published", author: "John Smith", date: "2024-07-27" },
  { id: 3, title: "Mastering Tailwind CSS for Modern UIs", status: "Draft", author: "Emily White", date: "2024-07-26" },
  { id: 4, title: "Getting Started with Next.js 14", status: "Published", author: "Chris Green", date: "2024-07-25" },
  { id: 5, title: "The Rise of Genkit for AI Applications", status: "Pending Review", author: "Sarah Brown", date: "2024-07-24" },
];

export default async function AdminPostsPage() {
  await requireAccess({ path: '/api/wp/posts', method: 'POST', action: 'write' })
  return (
    <div className="p-8">
      <PageHeader title="posts" subtitle="Manage / Revisions" />
      <div className="flex justify-between items-center mb-8">
        <Button asChild>
          <Link href="/editor/new"><PlusCircle className="mr-2 h-4 w-4" /> New Post</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search posts by title..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
             <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyAdminPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'Published' ? 'default' : post.status === 'Draft' ? 'secondary' : 'outline'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href={`/editor/${post.id}`}>Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>View Revisions</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Previous</Button>
        <div className="px-4 py-2 text-sm">Page 1 of 10</div>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  )
}
