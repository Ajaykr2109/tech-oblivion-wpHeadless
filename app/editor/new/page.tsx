import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditorNewPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Publish</Button>
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
                  <Input id="title" placeholder="Post Title" />
                </div>
                <div>
                  <Label htmlFor="content">Body</Label>
                  <Textarea id="content" rows={15} placeholder="Write your post content here..."/>
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
                  <Input id="category" placeholder="e.g., Technology" />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Comma-separated tags" />
                </div>
                 <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="isPublished" defaultChecked />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
