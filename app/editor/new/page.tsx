
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Bold, Italic, Link as LinkIcon, List, ListOrdered, Code } from "lucide-react";

const EditorToolbar = () => (
  <div className="flex items-center gap-1 border-b p-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bold</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Italic</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Code className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Code</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Link</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bulleted List</p>
        </TooltipContent>
      </Tooltip>
       <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Numbered List</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);


export default function EditorNewPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Publish</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="sr-only">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Post Title" 
                    className="text-2xl font-bold h-auto p-4 border-none focus-visible:ring-0 shadow-none border-b rounded-none" 
                  />
                </div>
                <EditorToolbar />
                <div>
                  <Label htmlFor="content" className="sr-only">Body</Label>
                  <Textarea 
                    id="content" 
                    rows={25} 
                    placeholder="Write your post content here..."
                    className="border-none focus-visible:ring-0 shadow-none text-base p-4"
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
                    <Select defaultValue="Draft">
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
                  <Button className="w-full">Publish</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="categories">
              <AccordionTrigger className="p-4 bg-card rounded-t-lg border mt-4">Categories & Tags</AccordionTrigger>
              <AccordionContent className="p-4 bg-card rounded-b-lg border border-t-0">
                 <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="e.g., Technology" />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input id="tags" placeholder="Comma-separated tags" />
                       <div className="flex flex-wrap gap-2 mt-2">
                        {/* Example tags would appear here as they are added */}
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
                      <Input id="seoTitle" placeholder="Title for search engines" />
                    </div>
                    <div>
                      <Label htmlFor="seoDescription">Meta Description</Label>
                      <Textarea id="seoDescription" rows={4} placeholder="Description for search engines" />
                    </div>
                     <div>
                      <Label htmlFor="focusKeyword">Focus Keyword</Label>
                      <Input id="focusKeyword" placeholder="Main keyword for this post" />
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
