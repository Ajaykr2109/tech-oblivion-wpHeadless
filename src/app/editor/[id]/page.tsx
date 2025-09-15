'use client';

import { Upload, LinkIcon, Bot, X, Settings, FileText, Search, Camera, Zap, BarChart3, Bold, Italic, Heading, List, Link as LinkIcon2, Code } from "lucide-react";
import React, { useState, useEffect, use } from "react";
import ReactMarkdown from 'react-markdown';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RoleGate } from "@/hooks/useRoleGate";
// Import new editor components
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { CollapsibleCard } from "@/components/editor/CollapsibleCard";
import { ZenModeToggle } from "@/components/editor/ZenModeToggle";
import { SeoHints } from "@/components/editor/SeoHints";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // New UI states
  const [isZenMode, setIsZenMode] = useState(false);
  const [previewMode, setPreviewMode] = useState<'write' | 'split' | 'preview'>('write');
  
  // Ref for the content textarea
  const contentTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (!modKey) return;

      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleFormat('bold');
      }
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleFormat('italic');
      }
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleFormat('link');
      }
      if (e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleFormat('heading');
      }
      if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleFormat('list');
      }
      if (e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleFormat('code');
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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
  const handleAddTag = async (tagName?: string) => {
    const nameToAdd = tagName || tagInput.trim();
    if (!nameToAdd) return;
    
    console.log('Adding tag:', nameToAdd);
    
    // Check if tag already exists in available tags
    const existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === nameToAdd.toLowerCase()
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
        console.log('Creating new tag:', nameToAdd);
        const response = await fetch('/api/wp/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameToAdd })
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
    
    if (!tagName) setTagInput(''); // Only clear input if called without explicit tag name
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
    const textarea = contentTextareaRef.current;
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
      {/* Floating Toolbar */}
      <FloatingToolbar onFormat={handleFormat} textareaRef={contentTextareaRef} />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">Edit Post</h1>
              {error && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md">
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm text-muted-foreground hidden md:flex items-center gap-2 sm:gap-4">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readingTime} min read</span>
              </div>
              {/* Preview mode toggle */}
                    {/* Preview mode toggle */}
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  size="sm"
                  variant={previewMode === 'write' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('write')}
                  className="border-r"
                >
                  Write
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'split' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('split')}
                  className="border-r"
                >
                  Split
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'preview' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('preview')}
                >
                  Preview
                </Button>
              </div>
              <ZenModeToggle isZenMode={isZenMode} onToggle={() => setIsZenMode(!isZenMode)} iconOnly />
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
        <div className={`flex flex-col lg:flex-row transition-all duration-300 ${isZenMode ? 'max-w-none' : ''}`}>
          {/* Main Editor Area (60% in normal mode, 100% in zen mode) */}
          <div className={`transition-all duration-300 ${
            isZenMode ? 'flex-1' : 'flex-1 lg:max-w-[60%]'
          }`}>
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Title Input */}
                <div>
                  <Input 
                    id="title" 
                    name="title"
                    value={post.title} 
                    onChange={handleInputChange}
                    placeholder="Enter your post title..." 
                    className="text-2xl sm:text-3xl font-bold border-none px-0 py-4 h-auto focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground/50" 
                  />
                </div>
                
                {/* Persistent Toolbar */}
                <TooltipProvider>
                  <div className="flex gap-2 mb-4 p-2 border rounded-lg bg-muted/20">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleFormat('bold')}>
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bold (Ctrl+B)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleFormat('italic')}>
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Italic (Ctrl+I)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleFormat('heading')}>
                          <Heading className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Heading (Ctrl+Shift+H)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleFormat('list')}>
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>List (Ctrl+Shift+L)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleFormat('link')}>
                          <LinkIcon2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Link (Ctrl+K)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleFormat('code')}>
                          <Code className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Code (Ctrl+Shift+C)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                {/* Content Editor */}
                <div className="space-y-4">
                  {previewMode === 'write' && (
                    <Textarea 
                      ref={contentTextareaRef}
                      id="content" 
                      name="content"
                      value={post.content} 
                      onChange={handleInputChange}
                      placeholder="Start writing your story..."
                      className="min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] border-none px-0 py-6 focus-visible:ring-0 shadow-none text-base sm:text-lg resize-none bg-transparent leading-relaxed placeholder:text-muted-foreground/50 font-normal"
                    />
                  )}

                  {previewMode === 'split' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <span>Editor</span>
                          <span className="text-xs text-muted-foreground">Markdown</span>
                        </h3>
                        <Textarea 
                          ref={contentTextareaRef}
                          id="content" 
                          name="content"
                          value={post.content} 
                          onChange={handleInputChange}
                          placeholder="Start writing your story..."
                          className="min-h-[50vh] border px-4 py-4 focus-visible:ring-2 text-base resize-none leading-relaxed placeholder:text-muted-foreground/50 font-mono"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <span>Preview</span>
                          <span className="text-xs text-muted-foreground">Live Render</span>
                        </h3>
                        <div className="border rounded-lg p-4 bg-background min-h-[50vh] overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                          {post.content ? (
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                          ) : (
                            <p className="text-muted-foreground italic">Start typing to see preview...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {previewMode === 'preview' && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <span>Preview Mode</span>
                        <span className="text-xs text-muted-foreground">Full Preview</span>
                      </h3>
                      <div className="border rounded-lg p-6 bg-background min-h-[60vh] prose dark:prose-invert max-w-none">
                        {post.content ? (
                          <ReactMarkdown>{post.content}</ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground italic text-center py-20">No content to preview</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Sidebar (60% in normal mode, hidden in zen mode) */}
          {!isZenMode && (
            <div className="w-full lg:w-[40%] lg:min-w-[400px] lg:max-w-[600px] border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/20 order-first lg:order-last flex flex-col lg:flex-row">
              {/* Left Info Panel - SEO, Analytics, Quick Tools */}
              <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto border-r border-border/50">
                {/* Search Preview */}
                <CollapsibleCard 
                  title="Search Preview" 
                  icon={<BarChart3 className="h-4 w-4" />}
                  defaultExpanded
                >
                  <SeoPreview 
                    title={post.seoTitle || post.title} 
                    description={post.seoDescription} 
                    slug={post.slug} 
                  />
                </CollapsibleCard>

                {/* SEO Hints */}
                <CollapsibleCard 
                  title="SEO Score" 
                  icon={<Search className="h-4 w-4" />}
                  defaultExpanded
                >
                  <SeoHints 
                    title={post.seoTitle || post.title}
                    description={post.seoDescription}
                    keyword={post.focusKeyword}
                    content={post.content}
                  />
                </CollapsibleCard>

                {/* Quick Tools */}
                <CollapsibleCard 
                  title="Quick Tools" 
                  icon={<Zap className="h-4 w-4" />}
                  defaultExpanded
                >
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start h-9">
                      <Bot className="mr-2 h-4 w-4" /> 
                      AI Writing Assistant
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start h-9">
                      <LinkIcon className="mr-2 h-4 w-4" /> 
                      Find Internal Links
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start h-9">
                      <FileText className="mr-2 h-4 w-4" /> 
                      Content Analysis
                    </Button>
                  </div>
                </CollapsibleCard>
              </div>

              {/* Right Settings Panel - Status, Categories, Tags, SEO */}
              <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                {/* Status & Publishing */}
                <CollapsibleCard 
                  title="Status & Publishing" 
                  icon={<Settings className="h-4 w-4" />}
                  defaultExpanded
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Status</Label>
                      <RoleGate action="draft" as="span">
                        <Button size="sm" variant="outline" disabled={saving} onClick={updatePost}>
                          {saving ? 'Saving…' : 'Save Draft'}
                        </Button>
                      </RoleGate>
                    </div>
                    <Select value={post.status} onValueChange={(value) => setPost(p => ({...p, status: value}))}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleCard>

                {/* Categories & Tags */}
                <CollapsibleCard 
                  title="Categories & Tags" 
                  icon={<FileText className="h-4 w-4" />}
                  defaultExpanded
                >
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Category</Label>
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
                          <SelectTrigger className="h-9">
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
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Tags</Label>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Debug: Selected tag IDs: [{selectedTagIds.join(', ') || 'none'}]
                        </div>
                      )}
                      {loadingTags ? (
                        <div className="text-sm text-muted-foreground">Loading tags...</div>
                      ) : (
                        <>
                          <Input 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Type to add tags..." 
                            className="h-9 mb-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                if (tagInput.trim()) {
                                  handleAddTag(tagInput.trim());
                                  setTagInput('');
                                }
                              }
                            }}
                          />
                          {tagInput && (
                            <div className="border rounded mt-1 bg-background shadow-sm max-h-32 overflow-y-auto mb-3">
                              {availableTags
                                .filter(tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()))
                                .map(tag => (
                                  <div
                                    key={tag.id}
                                    className="px-2 py-1 hover:bg-muted cursor-pointer text-sm"
                                    onClick={() => {
                                      handleAddTag(tag.name);
                                      setTagInput('');
                                    }}
                                  >
                                    {tag.name}
                                  </div>
                                ))}
                            </div>
                          )}
                          {getSelectedTags().length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {getSelectedTags().map(tag => (
                                <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
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
                  </div>
                </CollapsibleCard>

                {/* SEO & Metadata */}
                <CollapsibleCard 
                  title="SEO & Metadata" 
                  icon={<Search className="h-4 w-4" />}
                  defaultExpanded
                >
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">SEO Title</Label>
                      <Input 
                        name="seoTitle" 
                        value={post.seoTitle} 
                        onChange={handleInputChange} 
                        placeholder="Meta title for search engines" 
                        className="h-9 text-sm"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {post.seoTitle.length}/60 characters
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Meta Description</Label>
                      <Textarea 
                        name="seoDescription" 
                        value={post.seoDescription} 
                        onChange={handleInputChange} 
                        placeholder="Description for search engines" 
                        className="text-sm min-h-[80px] resize-none"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {post.seoDescription.length}/160 characters
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Focus Keyword</Label>
                      <Input 
                        name="focusKeyword" 
                        value={post.focusKeyword} 
                        onChange={handleInputChange} 
                        placeholder="Main keyword" 
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                {/* Featured Image */}
                <CollapsibleCard 
                  title="Featured Image" 
                  icon={<Camera className="h-4 w-4" />}
                >
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </CollapsibleCard>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}