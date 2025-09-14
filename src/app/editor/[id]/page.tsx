'use client';

import { Upload, Bold, Italic, Link as LinkIcon, List, ListOrdered, Code, Strikethrough, Quote, Image as ImageIcon, Type, Bot, X } from "lucide-react";
import React, { useState, useEffect, use } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { RoleGate } from "@/hooks/useRoleGate";

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  if (typeof window === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Types for categories and tags
type WpCategory = { id: number; name: string; slug: string; parent: number; count?: number };
type WpTag = { id: number; name: string; slug: string; count?: number };

// Helper function to convert HTML to Markdown (Obsidian-style)
function convertHtmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Convert headings with proper hierarchy
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n\n##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n\n###### $1\n\n');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gi, '\n$1\n');
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gi, '\n$1\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n\n> $1\n\n');
  
  // Convert code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert formatting
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  
  // Convert horizontal rules
  markdown = markdown.replace(/<hr[^>]*\/?>/gi, '\n\n---\n\n');
  
  // Convert line breaks
  markdown = markdown.replace(/<br[^>]*\/?>/gi, '  \n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  const lines = markdown.split('\n');
  const cleanLines = lines.map(line => line.trim());
  markdown = cleanLines.join('\n');
  
  // Remove excessive line breaks (simple string replacement)
  while (markdown.includes('\n\n\n\n')) {
    markdown = markdown.replace('\n\n\n\n', '\n\n\n');
  }
  while (markdown.includes('\n\n\n')) {
    markdown = markdown.replace('\n\n\n', '\n\n');
  }
  
  return markdown.trim();
}

const EditorToolbar = ({ onFormat }: { onFormat: (type: string) => void }) => (
  <div className="flex items-center gap-0.5">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('bold')}>
            <Bold className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Bold</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('italic')}>
            <Italic className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Italic</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('strikethrough')}>
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Strikethrough</p></TooltipContent>
      </Tooltip>
      <div className="w-px h-4 bg-border mx-1" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('heading')}>
            <Type className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Heading</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('list')}>
            <List className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>List</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('orderedList')}>
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Numbered List</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('quote')}>
            <Quote className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Quote</p></TooltipContent>
      </Tooltip>
      <div className="w-px h-4 bg-border mx-1" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('link')}>
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Link</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('image')}>
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Image</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onFormat('code')}>
            <Code className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Code</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

const SeoPreview = ({ title, description, slug }: { title: string, description: string, slug: string }) => {
    const siteUrl = "https://tech.oblivion";
    const fullUrl = `${siteUrl}/blog/${slug}`;

    return (
        <div className="p-3 border rounded-lg bg-background text-xs">
            <h3 className="text-blue-600 font-medium truncate leading-tight">{title || "Meta Title Preview"}</h3>
            <p className="text-green-700 truncate mt-0.5">{fullUrl}</p>
            <p className="text-muted-foreground line-clamp-2 mt-1 leading-tight">{description || "This is how your meta description will appear in search results."}</p>
        </div>
    );
};

export default function EditorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [post, setPost] = useState({
    title: "",
    content: "",
    tags: "",
    category: "",
    status: "Draft",
    seoTitle: "",
    seoDescription: "",
    focusKeyword: "",
    slug: "",
  });
  
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Categories and tags state
  const [availableCategories, setAvailableCategories] = useState<WpCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<WpTag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  // Fetch categories and tags on component mount - do this first
  useEffect(() => {
    async function fetchCategoriesAndTags() {
      try {
        // Fetch categories
        setLoadingCategories(true);
        const categoriesResponse = await fetch('/api/wp/categories?per_page=100&hide_empty=0', {
          cache: 'no-store',
          credentials: 'include'
        });
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          setAvailableCategories(categories);
          console.log('Loaded categories:', categories.length);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
      
      try {
        // Fetch tags
        setLoadingTags(true);
        const tagsResponse = await fetch('/api/wp/tags?per_page=100', {
          cache: 'no-store',
          credentials: 'include'
        });
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json();
          setAvailableTags(tags);
          console.log('Loaded tags:', tags.length);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      } finally {
        setLoadingTags(false);
      }
    }
    
    fetchCategoriesAndTags();
  }, []);

  // Fetch post data on component mount - this happens after categories/tags are loaded
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching post with ID:', id)
        
        const response = await fetch(`/api/wp/posts?id=${encodeURIComponent(id)}&_embed=1`, {
          cache: 'no-store',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found')
          }
          const errorText = await response.text()
          console.log('Error response:', errorText)
          throw new Error(`Failed to fetch post (${response.status}): ${errorText}`)
        }
        
        const postData = await response.json()
        console.log('API Response:', postData)
        
        // Handle both single object and array responses
        const post = Array.isArray(postData) ? postData[0] : postData
        
        console.log('Extracted post:', post)
        
        if (post && post.id) {
          console.log('🔍 Full post object structure:', {
            id: post.id,
            title: post.title,
            categories: post.categories,
            tags: post.tags,
            _embedded: post._embedded,
            _links: post._links
          });
          
          // Log ALL properties of the post object to find where tags might be
          console.log('🔍 ALL post properties:', Object.keys(post));
          console.log('🔍 Full post object for detailed inspection:', post);
          
          // Check for alternative tag properties
          const alternativeTagProps = ['tag_ids', 'post_tags', 'wp_tags', 'taxonomy_tags', 'post_tag'];
          alternativeTagProps.forEach(prop => {
            if (post[prop]) {
              console.log(`🏷️ Found alternative tag property '${prop}':`, post[prop]);
            }
          });
          
          // Also check if there are any taxonomy-related properties
          Object.keys(post).forEach(key => {
            if (key.toLowerCase().includes('tag') || key.toLowerCase().includes('tax')) {
              console.log(`🏷️ Found potential tag/taxonomy property '${key}':`, post[key]);
            }
          });
          // Extract title and content from WordPress response format
          const title = typeof post.title === 'object' && post.title?.rendered 
            ? post.title.rendered 
            : (typeof post.title === 'string' ? post.title : '')
          
          // For content, prefer raw content for editing, fallback to rendered
          let content = ''
          if (typeof post.content === 'object') {
            content = post.content?.raw || post.content?.rendered || ''
          } else if (typeof post.content === 'string') {
            content = post.content
          }
          
          // If we only have rendered content, convert HTML to markdown for editing
          if (content && !post.content?.raw && post.content?.rendered) {
            console.warn('Converting HTML to markdown for editing')
            content = convertHtmlToMarkdown(content)
          }
          
          // Decode HTML entities in both title and content
          const decodedTitle = decodeHtmlEntities(title)
          const decodedContent = decodeHtmlEntities(content)
          
          console.log('Extracted title:', decodedTitle)
          console.log('Extracted content preview:', decodedContent.substring(0, 200))
        
          // Extract category and tags from embedded data AND direct IDs
          // WordPress REST API embeds terms in this order: [categories, tags, ...]
          const embeddedTerms = post._embedded?.['wp:term'] || []
          console.log('All embedded terms:', embeddedTerms)
          console.log('Embedded terms length:', embeddedTerms.length)
          
          // Log each embedded term array separately
          embeddedTerms.forEach((termArray: unknown[], index: number) => {
            console.log(`Embedded terms[${index}]:`, termArray);
            if (termArray && termArray.length > 0) {
              console.log(`  - First item in terms[${index}]:`, termArray[0]);
              console.log(`  - Taxonomy:`, (termArray[0] as { taxonomy?: string })?.taxonomy);
            }
          });
          
          const categories = embeddedTerms[0] || [] // First array is categories
          const tags = embeddedTerms[1] || [] // Second array is tags
          
          console.log('Extracted categories:', categories)
          console.log('Extracted tags:', tags)
          
          // Also get the direct category and tag IDs from the post object
          const directCategoryIds = post.categories || []
          const directTagIds = post.tags || []
          console.log('Direct category IDs from post:', directCategoryIds)
          console.log('Direct tag IDs from post:', directTagIds)
          
          // Apply category selection using direct IDs (most reliable)
          if (directCategoryIds.length > 0) {
            const categoryId = directCategoryIds[0];
            setSelectedCategoryId(categoryId);
            console.log('✅ Pre-selected category ID:', categoryId);
          } else {
            console.log('❌ No categories found in post');
          }
          
          // Apply tag selection using direct IDs (most reliable)
          if (directTagIds.length > 0) {
            setSelectedTagIds(directTagIds);
            console.log('✅ Pre-selected tag IDs:', directTagIds);
          } else {
            console.log('❌ No tags found in post');
          }
          
          console.log('🎯 Final selections applied:', {
            categoryId: directCategoryIds[0] || null,
            tagIds: directTagIds
          });
          
          // Extract and set additional metadata
          const excerpt = typeof post.excerpt === 'object' && post.excerpt?.rendered 
            ? post.excerpt.rendered.replace(/<[^>]*>/g, '') 
            : ''
          
          // Handle featured media if available
          const featuredMedia = post.featured_media || null
          console.log('Featured media ID:', featuredMedia)
          
          // Handle post format if available
          const postFormat = post.format || 'standard'
          console.log('Post format:', postFormat)
          
          // Extract visibility/password protection if any
          const postPassword = post.password || ''
          const postVisibility = post.password ? 'password' : (post.status === 'private' ? 'private' : 'public')
          console.log('Post visibility:', postVisibility, 'Password protected:', !!postPassword)
          
          // Extract publication date
          const publishDate = post.date || ''
          console.log('Publication date:', publishDate)
          
          // Extract author info if available
          const authorId = post.author || null
          console.log('Author ID:', authorId)
          
          setPost({
            title: decodedTitle.replace(/<[^>]*>/g, ''), // Strip HTML tags from title
            content: decodedContent, // Use decoded and converted content for editing
            tags: tags.length > 0 ? tags.map((tag: { name: string }) => tag.name).join(', ') : '',
            category: categories.length > 0 ? categories[0].name : '',
            status: post.status === 'publish' ? 'Published' : 
                   post.status === 'pending' ? 'Pending Review' : 'Draft',
            seoTitle: decodeHtmlEntities(post.yoast_head_json?.title || title || ''),
            seoDescription: decodeHtmlEntities(post.yoast_head_json?.description || excerpt || ''),
            focusKeyword: post.yoast_head_json?.focus_keywords?.[0] || '',
            slug: post.slug || '',
          })
          
          console.log('Post data loaded and state updated with pre-selected options');
        } else {
          console.warn('No post data found in API response')
          setError('Post not found or no data returned')
        }
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    
    // Only fetch post if we have an ID and categories/tags are not actively loading
    // This ensures we have the taxonomy data available when we try to pre-select
    if (id && !loadingCategories && !loadingTags) {
      fetchPost()
    }
  }, [id, loadingCategories, loadingTags]) // Add dependencies so it refetches when taxonomies are loaded

  useEffect(() => {
    const words = post.content.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setWordCount(count);
    setReadingTime(Math.ceil(count / 225));
  }, [post.content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  // Handle tag management
  const handleAddTag = async () => {
    if (!tagInput.trim()) return;
    
    const tagName = tagInput.trim();
    console.log('Adding tag:', tagName);
    
    // Check if tag already exists in available tags
    const existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );
    
    if (existingTag) {
      // Add existing tag if not already selected
      if (!selectedTagIds.includes(existingTag.id)) {
        const newSelectedTagIds = [...selectedTagIds, existingTag.id];
        setSelectedTagIds(newSelectedTagIds);
        console.log('Added existing tag:', existingTag.name, 'ID:', existingTag.id);
        console.log('New selected tag IDs:', newSelectedTagIds);
      } else {
        console.log('Tag already selected:', existingTag.name);
      }
    } else {
      // Create new tag
      try {
        console.log('Creating new tag:', tagName);
        const response = await fetch('/api/wp/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: tagName })
        });
        if (response.ok) {
          const newTag = await response.json();
          console.log('Created new tag:', newTag);
          setAvailableTags([...availableTags, newTag]);
          const newSelectedTagIds = [...selectedTagIds, newTag.id];
          setSelectedTagIds(newSelectedTagIds);
          console.log('Added new tag to selection:', newTag.name, 'ID:', newTag.id);
        }
      } catch (err) {
        console.error('Error creating tag:', err);
      }
    }
    
    setTagInput('');
  };
  
  const handleRemoveTag = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.filter(id => id !== tagId);
    setSelectedTagIds(newSelectedTagIds);
    const removedTag = availableTags.find(tag => tag.id === tagId);
    console.log('Removed tag:', removedTag?.name, 'ID:', tagId);
    console.log('New selected tag IDs:', newSelectedTagIds);
  };
  
  const getSelectedTags = () => {
    return selectedTagIds.map(id => 
      availableTags.find(tag => tag.id === id)
    ).filter(Boolean) as WpTag[];
  };

  // Handle markdown formatting
  const handleFormat = (type: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = selectedText;

    switch (type) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'strikethrough':
        replacement = `~~${selectedText}~~`;
        break;
      case 'heading':
        replacement = `## ${selectedText}`;
        break;
      case 'list':
        replacement = `- ${selectedText}`;
        break;
      case 'orderedList':
        replacement = `1. ${selectedText}`;
        break;
      case 'quote':
        replacement = `> ${selectedText}`;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        break;
      case 'image':
        replacement = `![${selectedText}](image-url)`;
        break;
      case 'code':
        replacement = selectedText.includes('\n') ? `\`\`\`\n${selectedText}\n\`\`\`` : `\`${selectedText}\``;
        break;
    }

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setPost(prev => ({ ...prev, content: newValue }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  async function updatePost() {
    setSaving(true); setError(null)
    try {
      const body = {
        title: post.title?.trim() || undefined,
        content: post.content || undefined,
        status: (post.status || '').toLowerCase().includes('publish') ? 'publish' : ((post.status || '').toLowerCase().includes('pending') ? 'pending' : 'draft'),
        slug: post.slug?.trim() || undefined,
        categories: selectedCategoryId ? [selectedCategoryId] : [],
        tags: selectedTagIds,
      }
      const res = await fetch(`/api/wp/posts?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(`Failed to update (${res.status}): ${t.slice(0,200)}`)
      }
      alert('Post updated successfully!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Edit Post</h1>
              {error && <div className="text-sm text-red-500 bg-red-50 px-2 py-1 rounded">{error}</div>}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground hidden sm:block">
                {wordCount} words • {readingTime} min read
              </div>
              <Button variant="outline" size="sm">Preview</Button>
              <RoleGate action="draft" as="span">
                <Button size="sm" disabled={saving || loading} onClick={updatePost}>
                  {saving ? 'Saving…' : 'Update'}
                </Button>
              </RoleGate>
            </div>
          </div>
        </div>
      </div>

      {loading || loadingCategories || loadingTags ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-muted-foreground">
            {loadingCategories || loadingTags ? 'Loading categories and tags...' : 'Loading post...'}
          </div>
        </div>
      ) : (
        <div className="flex">
          {/* Main Editor */}
          <div className="flex-1 min-w-0">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
              <div className="space-y-1">
                {/* Title */}
                <Input 
                  id="title" 
                  name="title"
                  value={post.title} 
                  onChange={handleInputChange}
                  placeholder="Enter post title..." 
                  className="text-2xl font-bold border-none px-0 py-2 h-auto focus-visible:ring-0 shadow-none bg-transparent" 
                />
                
                {/* Compact Toolbar */}
                <div className="flex items-center gap-1 py-2 border-b border-border/50">
                  <EditorToolbar onFormat={handleFormat} />
                </div>
                
                {/* Content Editor */}
                <Textarea 
                  id="content" 
                  name="content"
                  value={post.content} 
                  onChange={handleInputChange}
                  placeholder="Start writing your content in Markdown format..."
                  className="min-h-[60vh] border-none px-0 py-4 focus-visible:ring-0 shadow-none text-base font-mono resize-none bg-transparent leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Compact Sidebar */}
          <div className="w-80 border-l bg-muted/30 min-h-screen">
            <div className="p-4 space-y-4">
              {/* Quick Publish */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Status</Label>
                  <RoleGate action="draft" as="span">
                    <Button size="sm" variant="outline" disabled={saving} onClick={updatePost}>
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                  </RoleGate>
                </div>
                <Select value={post.status} onValueChange={(value) => setPost(p => ({...p, status: value}))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Categories & Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Debug: Selected category ID: {selectedCategoryId || 'none'}
                  </div>
                )}
                {loadingCategories ? (
                  <div className="text-sm text-muted-foreground">Loading categories...</div>
                ) : (
                  <Select 
                    value={selectedCategoryId?.toString() || "none"} 
                    onValueChange={(value) => {
                      const newCategoryId = value === "none" ? null : parseInt(value);
                      setSelectedCategoryId(newCategoryId);
                      console.log('Category changed to:', newCategoryId);
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {availableCategories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Label className="text-sm font-medium">Tags</Label>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Debug: Selected tag IDs: [{selectedTagIds.join(', ') || 'none'}]
                  </div>
                )}
                {loadingTags ? (
                  <div className="text-sm text-muted-foreground">Loading tags...</div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag" 
                        className="h-8 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={handleAddTag}
                      >
                        Add
                      </Button>
                    </div>
                    {getSelectedTags().length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {getSelectedTags().map(tag => (
                          <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-0 flex items-center gap-1">
                            {tag.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto w-auto p-0 hover:bg-transparent"
                              onClick={() => handleRemoveTag(tag.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />

              {/* SEO Quick Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">SEO Title</Label>
                <Input 
                  name="seoTitle" 
                  value={post.seoTitle} 
                  onChange={handleInputChange} 
                  placeholder="Meta title for search engines" 
                  className="h-8 text-sm"
                />
                
                <Label className="text-sm font-medium">Meta Description</Label>
                <Textarea 
                  name="seoDescription" 
                  value={post.seoDescription} 
                  onChange={handleInputChange} 
                  placeholder="Description for search engines" 
                  className="text-sm min-h-[60px] resize-none"
                />
                
                <Label className="text-sm font-medium">Focus Keyword</Label>
                <Input 
                  name="focusKeyword" 
                  value={post.focusKeyword} 
                  onChange={handleInputChange} 
                  placeholder="Main keyword" 
                  className="h-8 text-sm"
                />
              </div>

              <Separator />

              {/* SEO Preview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Preview</Label>
                <SeoPreview title={post.seoTitle || post.title} description={post.seoDescription} slug={post.slug} />
              </div>

              <Separator />

              {/* Featured Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Featured Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                </div>
              </div>

              <Separator />

              {/* Quick Tools */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Tools</Label>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-8">
                    <Bot className="mr-2 h-3 w-3" /> 
                    AI Writing Assistant
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8">
                    <LinkIcon className="mr-2 h-3 w-3" /> 
                    Find Internal Links
                  </Button>
                </div>
              </div>

              {/* SEO Score */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">SEO Score</Label>
                <div className="bg-background rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Overall Score</span>
                    <span className="text-sm font-medium text-green-600">Good</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Title length optimized
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Meta description set
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Add focus keyword to content
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}