
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Bold, Italic, Link as LinkIcon, List, ListOrdered, Code, Strikethrough, Quote, Image as ImageIcon, Type, Minus, Info, Bot } from "lucide-react";

const EditorToolbar = () => (
    <div className="flex items-center gap-1 border-b p-2 flex-wrap">
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
              <Strikethrough className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Strikethrough</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
                <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading</p>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Quote className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Blockquote</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Horizontal Rule</p>
          </TooltipContent>
        </Tooltip>
         <Separator orientation="vertical" className="h-6 mx-1" />
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
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Image</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Code Block</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );


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
      
      <div className="space-y-6">
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
                  rows={20} 
                  placeholder="Write your post content here..."
                  className="border-none focus-visible:ring-0 shadow-none text-base p-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="publishing" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
            <TabsTrigger value="taxonomy">Categories & Tags</TabsTrigger>
            <TabsTrigger value="image">Featured Image</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="publishing">
            <Card>
              <CardContent className="p-6 space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxonomy">
            <Card>
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="seoTitle">Meta Title</Label>
                  <Input id="seoTitle" placeholder="Title for search engines" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea id="seoDescription" rows={3} placeholder="Description for search engines" />
                </div>
                <div>
                  <Label htmlFor="focusKeyword">Focus Keyword</Label>
                  <Input id="focusKeyword" placeholder="Main keyword for this post" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="linkingKeywords">Auto-Linking Keywords</Label>
                  <Textarea id="linkingKeywords" rows={3} placeholder="Enter keywords, one per line, to find linking opportunities." />
                  <Button variant="outline" className="w-full"><Bot className="mr-2 h-4 w-4" /> Generate Link Suggestions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="checklist">
            <Card>
              <CardContent className="p-6">
                  <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Pre-Publish Checks</AlertTitle>
                      <AlertDescription>
                          <ul className="list-disc pl-4 text-xs space-y-1 mt-2">
                              <li><strong>Title Length:</strong> 50-60 characters recommended.</li>
                              <li><strong>Meta Description:</strong> 150-160 characters recommended.</li>
                              <li><strong>Focus Keyword:</strong> Included in title, meta, and first paragraph.</li>
                              <li><strong>Featured Image:</strong> Set and has alt text.</li>
                              <li><strong>Internal Links:</strong> At least 1-2 relevant internal links.</li>
                          </ul>
                      </AlertDescription>
                  </Alert>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
