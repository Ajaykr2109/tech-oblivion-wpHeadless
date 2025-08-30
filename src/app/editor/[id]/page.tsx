
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, X, Bold, Italic, Link as LinkIcon, List, ListOrdered, Code, Strikethrough, Quote, Image as ImageIcon, Type, Minus, Info, Bot } from "lucide-react";
import React, { useState, useEffect } from "react";
import { RoleGate } from "@/hooks/useRoleGate";
import Link from "next/link";

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
            <p>Bold (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic (Ctrl+I)</p>
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
            <p>Link (Ctrl+K)</p>
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

const SeoPreview = ({ title, description, slug }: { title: string, description: string, slug: string }) => {
    const siteUrl = "https://tech.oblivion"; // This could be fetched from settings
    const fullUrl = `${siteUrl}/blog/${slug}`;

    return (
        <div className="p-4 border rounded-lg bg-background/50">
            <h3 className="text-blue-600 text-lg truncate">{title || "Meta Title Preview"}</h3>
            <p className="text-green-700 text-sm truncate">{fullUrl}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{description || "This is how your meta description will appear in search results."}</p>
        </div>
    );
};


export default function EditorEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // Dummy post data, in a real app this would be fetched
  const [post, setPost] = useState({
    title: `Sample Post Title for ID ${id}`,
    content: `This is the existing content for the post. It can be a long-form text with multiple paragraphs...`,
    tags: "Next.js, Tailwind, AI",
    category: "Web Development",
    status: "Published",
    seoTitle: "Best Sample Post Title Ever | SEO Version",
    seoDescription: "An optimized meta description for the sample post to attract more clicks from search engines.",
    focusKeyword: "Sample Post",
    slug: `sample-post-for-id-${id}`,
  });
  
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const words = post.content.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setWordCount(count);
    setReadingTime(Math.ceil(count / 225)); // Average reading speed
  }, [post.content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  async function updatePost() {
    setSaving(true); setError(null)
    try {
      const body = {
        title: post.title?.trim() || undefined,
        content: post.content || undefined,
        // Map UI status to WP status
        status: (post.status || '').toLowerCase().includes('publish') ? 'publish' : ((post.status || '').toLowerCase().includes('pending') ? 'pending' : 'draft'),
        slug: post.slug?.trim() || undefined,
      }
      const res = await fetch(`/api/wp/posts?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(`Failed to update (${res.status}): ${t.slice(0,200)}`)
      }
      alert('Post updated')
    } catch (e: any) {
      setError(e.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <div className="flex gap-2">
          <Button variant="outline">Preview</Button>
          <RoleGate action="draft" as="span">
            <Button disabled={saving} onClick={updatePost}>{saving ? 'Saving…' : 'Update Post'}</Button>
          </RoleGate>
        </div>
      </div>
    {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="sr-only">Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    value={post.title} 
                    onChange={handleInputChange}
                    placeholder="Post Title" 
                    className="text-2xl font-bold h-auto p-4 border-none focus-visible:ring-0 shadow-none border-b rounded-none" 
                  />
                </div>
                 <EditorToolbar />
                <div>
                  <Label htmlFor="content" className="sr-only">Body</Label>
                  <Textarea 
                    id="content" 
                    name="content"
                    value={post.content} 
                    onChange={handleInputChange}
                    rows={20} 
                    placeholder="Start with an engaging intro to hook your readers..."
                    className="border-none focus-visible:ring-0 shadow-none text-base p-4"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-2 border-t text-sm text-muted-foreground">
                <p>{wordCount} words</p>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <p>{readingTime} min read</p>
            </CardFooter>
          </Card>
        </div>
        
        <aside className="lg:col-span-4 space-y-6 lg:sticky top-20 self-start">
          <div className="space-y-6">
            <Accordion type="multiple" defaultValue={['publish', 'seo']} className="w-full">
              <AccordionItem value="publish">
                <AccordionTrigger className="font-semibold px-4 py-3 bg-card rounded-t-lg border">Publish</AccordionTrigger>
                <AccordionContent className="bg-card rounded-b-lg border border-t-0">
                  <div className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={post.status} onValueChange={(value) => setPost(p => ({...p, status: value}))}>
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
              <div className="sticky bottom-0 bg-card/80 backdrop-blur py-2">
                <RoleGate action="draft" as="span">
                  <Button className="w-full" disabled={saving} onClick={updatePost}>{saving ? 'Saving…' : 'Update'}</Button>
                </RoleGate>
              </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="taxonomy">
                <AccordionTrigger className="font-semibold px-4 py-3 bg-card rounded-t-lg border">Categories & Tags</AccordionTrigger>
                <AccordionContent className="bg-card rounded-b-lg border border-t-0">
                  <div className="p-4 grid gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" name="category" value={post.category} onChange={handleInputChange} placeholder="e.g., Technology" />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input id="tags" name="tags" value={post.tags} onChange={handleInputChange} placeholder="Comma-separated tags" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.split(',').map(tag => tag.trim() && (
                          <Badge key={tag} variant="secondary">{tag.trim()} <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><X className="h-3 w-3"/></Button></Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="image">
                <AccordionTrigger className="font-semibold px-4 py-3 bg-card rounded-t-lg border">Featured Image</AccordionTrigger>
                <AccordionContent className="bg-card rounded-b-lg border border-t-0">
                  <div className="p-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="seo">
                <AccordionTrigger className="font-semibold px-4 py-3 bg-card rounded-t-lg border">SEO Settings</AccordionTrigger>
                <AccordionContent className="bg-card rounded-b-lg border border-t-0">
                  <div className="p-4 grid gap-4">
                    <SeoPreview title={post.seoTitle} description={post.seoDescription} slug={post.slug} />
                    <div>
                      <Label htmlFor="seoTitle">Meta Title</Label>
                      <Input id="seoTitle" name="seoTitle" value={post.seoTitle} onChange={handleInputChange} placeholder="Title for search engines" />
                    </div>
                    <div>
                      <Label htmlFor="seoDescription">Meta Description</Label>
                      <Textarea id="seoDescription" name="seoDescription" value={post.seoDescription} onChange={handleInputChange} rows={3} placeholder="Description for search engines" />
                    </div>
                    <div>
                      <Label htmlFor="focusKeyword">Focus Keyword</Label>
                      <Input id="focusKeyword" name="focusKeyword" value={post.focusKeyword} onChange={handleInputChange} placeholder="Main keyword for this post" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="linking">
                 <AccordionTrigger className="font-semibold px-4 py-3 bg-card rounded-t-lg border">Auto Internal Linking</AccordionTrigger>
                  <AccordionContent className="bg-card rounded-b-lg border border-t-0">
                      <div className="p-4 space-y-2">
                           <Label htmlFor="linkingKeywords">Focus Linking Keywords</Label>
                            <Textarea id="linkingKeywords" rows={4} placeholder="Enter keywords, one per line, to find linking opportunities." />
                            <Button variant="outline" className="w-full"><Bot className="mr-2 h-4 w-4" /> Generate Link Suggestions</Button>
                      </div>
                  </AccordionContent>
              </AccordionItem>

              <AccordionItem value="checklist">
                 <AccordionTrigger className="font-semibold px-4 py-3 bg-card rounded-t-lg border">SEO Checklist</AccordionTrigger>
                  <AccordionContent className="bg-card rounded-b-lg border border-t-0">
                       <Alert className="m-4">
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
                  </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>
      </div>
    </div>
  )
}
