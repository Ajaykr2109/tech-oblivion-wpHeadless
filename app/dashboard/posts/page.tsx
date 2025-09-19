import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from '@/lib/auth'

interface UserPost {
  id: number
  title: { rendered: string }
  date: string
  excerpt: { rendered: string }
  status: string
  slug: string
}

export default async function DashboardPostsPage() {
  const user = await getSessionUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Fetch user's posts
  let userPosts: UserPost[] = []
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/wp/posts?author=${user.id}`, {
      cache: 'no-store'
    })
    if (response.ok) {
      userPosts = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch user posts:', error)
  }

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
                <CardTitle>{post.title.rendered}</CardTitle>
                <CardDescription>
                  {post.status === 'published' ? 'Published' : 'Draft'} on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-muted-foreground" 
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/blog/${post.slug}`}>View</Link>
                </Button>
                <Button asChild>
                  <Link href={`/editor/${post.id}`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="bg-card/50">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any posts yet. Start writing your first article!
              </p>
              <Button asChild>
                <Link href="/editor/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}