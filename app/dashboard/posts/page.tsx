import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { dummyPosts } from "@/data/dummy-posts";
import Link from "next/link";
import { Edit, Trash2, PlusCircle } from "lucide-react";

export default function DashboardPostsPage() {
  const userPosts = dummyPosts.slice(0, 3); // Placeholder for user-specific posts

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Posts</h1>
          <p className="text-muted-foreground">Manage your articles and drafts.</p>
        </div>
        <Button asChild>
          <Link href="/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Card key={post.id} className="bg-card/50">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  Published on {new Date(post.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/editor/${post.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No posts yet!</h2>
            <p className="text-muted-foreground mt-2">Start creating your first article.</p>
            <Button asChild className="mt-4">
              <Link href="/editor/new">Create a Post</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
