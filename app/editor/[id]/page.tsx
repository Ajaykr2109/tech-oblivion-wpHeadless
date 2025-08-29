import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Fetch existing post data using the id
  const post = {
    title: `Sample Post Title for ID ${id}`,
    content: `This is the existing content for the post. It can be a long-form text with multiple paragraphs...`,
    tags: "Next.js, Tailwind, AI",
    category: "Web Development",
    isPublished: true,
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Post #{id}</h1>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Publish Changes</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" defaultValue={post.title} placeholder="Post Title" />
                </div>
                <div>
                  <Label htmlFor="content">Body</Label>
                  <Textarea id="content" defaultValue={post.content} rows={15} placeholder="Write your post content here..."/>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" defaultValue={post.category} placeholder="e.g., Technology" />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" defaultValue={post.tags} placeholder="Comma-separated tags" />
                </div>
                 <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="isPublished" defaultChecked={post.isPublished} />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="file" />
               <p className="text-xs text-muted-foreground mt-2">Upload a new image to override the current one.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
