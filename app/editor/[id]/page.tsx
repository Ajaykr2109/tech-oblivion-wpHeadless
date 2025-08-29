
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";

export default async function EditorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Fetch existing post data using the id
  const post = {
    title: `Sample Post Title for ID ${id}`,
    content: `This is the existing content for the post. It can be a long-form text with multiple paragraphs...`,
    tags: "Next.js, Tailwind, AI",
    category: "Web Development",
    status: "Published",
    seoTitle: "Best Sample Post Title Ever | SEO Version",
    seoDescription: "An optimized meta description for the sample post to attract more clicks from search engines.",
    focusKeyword: "Sample Post",
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <div className="flex gap-2">
          <Button variant="outline">Preview</Button>
          <Button>Update Post</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="sr-only">Title</Label>
                  <Input 
                    id="title" 
                    defaultValue={post.title} 
                    placeholder="Post Title" 
                    className="text-2xl font-bold h-auto p-2 border-none focus-visible:ring-0 shadow-none" 
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="sr-only">Body</Label>
                  <Textarea 
                    id="content" 
                    defaultValue={post.content} 
                    rows={25} 
                    placeholder="Write your post content here... use markdown for formatting."
                    className="border-none focus-visible:ring-0 shadow-none text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <Accordion type="multiple" defaultValue={['publish', 'seo']} className="w-full">
            <AccordionItem value="publish">
              <AccordionTrigger className="p-4 bg-card rounded-t-lg border">Publish</AccordionTrigger>
              <AccordionContent className="p-4 bg-card rounded-b-lg border border-t-0">
                <div className="space-y-4">
                   <div>
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue={post.status}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Update</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="categories">
              <AccordionTrigger className="p-4 bg-card rounded-t-lg border mt-4">Categories & Tags</AccordionTrigger>
              <AccordionContent className="p-4 bg-card rounded-b-lg border border-t-0">
                 <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" defaultValue={post.category} placeholder="e.g., Technology" />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input id="tags" defaultValue={post.tags} placeholder="Comma-separated tags" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.split(',').map(tag => tag.trim() && (
                          <Badge key={tag} variant="secondary">{tag.trim()} <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><X className="h-3 w-3"/></Button></Badge>
                        ))}
                      </div>
                    </div>
                  </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="featured-image">
              <AccordionTrigger className="p-4 bg-card rounded-t-lg border mt-4">Featured Image</AccordionTrigger>
              <AccordionContent className="p-4 bg-card rounded-b-lg border border-t-0">
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seo">
              <AccordionTrigger className="p-4 bg-card rounded-t-lg border mt-4">SEO Settings</AccordionTrigger>
              <AccordionContent className="p-4 bg-card rounded-b-lg border border-t-0">
                <div className="space-y-4">
                    <div>
                      <Label htmlFor="seoTitle">Meta Title</Label>
                      <Input id="seoTitle" defaultValue={post.seoTitle} placeholder="Title for search engines" />
                    </div>
                    <div>
                      <Label htmlFor="seoDescription">Meta Description</Label>
                      <Textarea id="seoDescription" defaultValue={post.seoDescription} rows={4} placeholder="Description for search engines" />
                    </div>
                     <div>
                      <Label htmlFor="focusKeyword">Focus Keyword</Label>
                      <Input id="focusKeyword" defaultValue={post.focusKeyword} placeholder="Main keyword for this post" />
                    </div>
                  </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
