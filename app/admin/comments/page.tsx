
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Trash2, Reply, Slash, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'
import BulkActionsBar from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'
import CommentsClient from './pageClient'

const dummyComments = [
  { id: 1, author: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d", text: "This was an incredibly insightful article. The section on server components really cleared things up for me. Thanks!", post: "A Deep Dive into React Server Components", date: "2024-07-29" },
  { id: 2, author: "Maria Garcia", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d", text: "I'm not sure I agree with point number 3. Have you considered the performance implications on larger-scale applications?", post: "The Future of AI in Web Development", date: "2024-07-28" },
  { id: 3, author: "Sam Lee", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", text: "Great post! Do you have a GitHub repository with the code examples?", post: "Mastering Tailwind CSS for Modern UIs", date: "2024-07-28" },
];

export default async function AdminCommentsPage() {
  await requireAccess({ path: '/api/wp/comments/[id]', method: 'PATCH', action: 'moderate' })
  return (
    <div className="p-8">
      <PageHeader title="comments" subtitle="Approve / Disapprove / Spam" />
      <CommentsClient />
    </div>
  )
}
