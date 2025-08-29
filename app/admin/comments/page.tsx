
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Trash2, Reply } from 'lucide-react';

const dummyComments = [
  { id: 1, author: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d", text: "This was an incredibly insightful article. The section on server components really cleared things up for me. Thanks!", post: "A Deep Dive into React Server Components", date: "2024-07-29" },
  { id: 2, author: "Maria Garcia", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d", text: "I'm not sure I agree with point number 3. Have you considered the performance implications on larger-scale applications?", post: "The Future of AI in Web Development", date: "2024-07-28" },
  { id: 3, author: "Sam Lee", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", text: "Great post! Do you have a GitHub repository with the code examples?", post: "Mastering Tailwind CSS for Modern UIs", date: "2024-07-28" },
];

export default async function AdminCommentsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Comments Moderation</h1>
      
      <div className="space-y-6">
        {dummyComments.map(comment => (
          <Card key={comment.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={comment.avatar} alt={comment.author} />
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{comment.author}</p>
                  <p className="text-sm text-muted-foreground">
                    Commented on "{comment.post}" • {comment.date}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{comment.text}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm"><Reply className="mr-2 h-4 w-4" /> Reply</Button>
              <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
              <Button size="sm"><Check className="mr-2 h-4 w-4" /> Approve</Button>
            </CardFooter>
          </Card>
        ))}

        {dummyComments.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">All caught up!</h2>
            <p className="text-muted-foreground mt-2">There are no pending comments to moderate.</p>
          </div>
        )}
      </div>
    </div>
  )
}
