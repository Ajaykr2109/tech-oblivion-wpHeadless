
 'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Clock, Flame, Filter, Grid3X3, List, TrendingUp } from 'lucide-react'

import FeedSkeleton from '@/components/feed-skeleton'
import InfiniteScrollFeed from '@/components/infinite-scroll-feed'
import EnhancedBlogSearch from '@/components/enhanced-blog-search'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { decodeEntities } from '@/lib/entities'

type ViewMode = 'grid' | 'list'
type SortBy = 'latest' | 'popular' | 'trending'

interface Category {
  id: number
  name: string
  slug: string
}

interface Author {
  id: number
  name: string
  slug: string
}

export default function BlogIndexPage() {
  const urlSearchParams = useSearchParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState<string>(urlSearchParams?.get('q') || '')
  // Store filter values as WordPress numeric IDs (stringified)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('latest')
  const [selectedAuthor, setSelectedAuthor] = useState('all')
  const [categories, setCategories] = useState<Array<{ id: string, name: string, slug: string }>>([])
  const [authors, setAuthors] = useState<Array<{ id: string, name: string, slug: string }>>([])
  const [popularCategories, setPopularCategories] = useState<Array<{ id: string, name: string, slug: string }>>([])

  // Only treat as "submitted search" when URL contains q; typing alone won't flip UI
  const urlQ = urlSearchParams?.get('q') || ''
  const hasSearchQuery = !!(urlQ && urlQ.trim())

  // Fetch categories and authors for filters
  useEffect(() => {
    async function fetchFilterData() {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/wp/categories?per_page=50&hide_empty=true')
        if (categoriesRes.ok) {
          const categoriesData: Category[] = await categoriesRes.json()
          const mapped = categoriesData.map((cat) => ({ id: cat.id.toString(), name: decodeEntities(cat.name), slug: cat.slug }))
          setCategories(mapped)
          // Initialize category from URL if present (supports id or slug)
          const urlCat = urlSearchParams?.get('categoryId') || urlSearchParams?.get('category') || ''
          if (urlCat) {
            const byId = mapped.find(c => c.id === urlCat)
            const bySlug = mapped.find(c => c.slug === urlCat)
            if (byId) setSelectedCategory(byId.id)
            else if (bySlug) setSelectedCategory(bySlug.id)
          }
        }

        // Fetch authors
        const authorsRes = await fetch('/api/wp/users?per_page=50&has_published_posts[]=post')
        if (authorsRes.ok) {
          const authorsData: Author[] = await authorsRes.json()
          const mappedA = authorsData.map((author) => ({ id: author.id.toString(), name: author.name, slug: author.slug }))
          setAuthors(mappedA)
          const urlAuthor = urlSearchParams?.get('authorId') || urlSearchParams?.get('author') || ''
          if (urlAuthor) {
            const byId = mappedA.find(a => a.id === urlAuthor)
            const bySlug = mappedA.find(a => a.slug === urlAuthor)
            if (byId) setSelectedAuthor(byId.id)
            else if (bySlug) setSelectedAuthor(bySlug.id)
          }
        }

        // Fetch popular categories for quick filters
        try {
          const popRes = await fetch('/api/wp/categories/popular?limit=10', { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          })
          if (popRes.ok) {
            const pop = await popRes.json()
            const cats = Array.isArray(pop?.categories) ? pop.categories : []
            setPopularCategories(cats.map((c: { id: number; name: string; slug: string }) => ({ id: String(c.id), name: decodeEntities(c.name), slug: c.slug })))
          }
        } catch (e) {
          // Non-fatal
          console.warn('Failed to load popular categories', e)
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error)
        // Set fallback data
        setCategories([
          { id: 'ai', name: 'AI & Machine Learning', slug: 'ai' },
          { id: 'web-dev', name: 'Web Development', slug: 'web-dev' },
          { id: 'react', name: 'React & Frontend', slug: 'react' },
          { id: 'backend', name: 'Backend & DevOps', slug: 'backend' },
          { id: 'mobile', name: 'Mobile Development', slug: 'mobile' }
        ])
      }
    }

    fetchFilterData()
  }, [urlSearchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q.length) {
      router.push(`/blog?q=${encodeURIComponent(q)}`)
    }
  }

  // Quick tag click handler removed; using dynamic categories instead

  // Show active filters status
  const activeFiltersCount = [
    searchQuery.trim(),
    selectedCategory !== 'all' ? selectedCategory : '',
    sortBy !== 'latest' ? sortBy : '',
    selectedAuthor !== 'all' ? selectedAuthor : ''
  ].filter(Boolean).length

  const getFilteredTitle = () => {
    if (searchQuery.trim()) return `Search results for "${searchQuery}"`
    if (selectedCategory !== 'all') {
      const cat = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory)
      return `Articles in ${cat?.name || selectedCategory}`
    }
    if (selectedAuthor !== 'all') return `Articles by ${authors.find(a => a.slug === selectedAuthor)?.name || selectedAuthor}`
    return 'All Articles'
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header removed per requirements: start directly with Find Content filters */}

        {/* Enhanced Search with Results */}
        {hasSearchQuery ? (
          <EnhancedBlogSearch />
        ) : (
          <>
            {/* Clean Filters Section (Find Content) */}
            <div className="bg-card border rounded-xl p-6 mb-8 sticky top-20 z-30">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Filter className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Find Content</h3>
                    <p className="text-xs text-muted-foreground">Search and filter articles</p>
                  </div>
                </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
              {/* Search */}
              <form className="lg:col-span-2 relative" onSubmit={handleSearchSubmit}>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  aria-label="Search articles" 
                  placeholder="Search articles, topics..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              {/* Hidden submit button so Enter triggers search */}
              <button type="submit" className="hidden" aria-hidden="true" />
              </form>
              
              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Sort filter */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger aria-label="Sort by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Latest</span>
                  </SelectItem>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-2"><Flame className="h-4 w-4" /> Popular</span>
                  </SelectItem>
                  <SelectItem value="trending">
                    <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Trending</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Author filter */}
            {authors.length > 0 && (
              <div className="mt-3">
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                  <SelectTrigger aria-label="Filter by author" className="w-48">
                    <SelectValue placeholder="Filter by author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Clear button moved to quick filters row to reduce layout shifts */}
          </div>
          
          {/* Quick filter categories (dynamic) + Clear button */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground mr-2">Popular:</span>
            {popularCategories.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                size="sm"
                className={`rounded-full text-xs h-7 ${selectedCategory !== 'all' && selectedCategory !== cat.id ? 'opacity-60' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  // Clear search when selecting a category quick filter
                  setSearchQuery('')
                }}
                aria-pressed={selectedCategory === cat.id}
              >
                {cat.name}
              </Button>
            ))}
            <div className="ml-auto">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSortBy('latest')
                    setSelectedAuthor('all')
                  }}
                >
                  Clear all filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* All Articles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {getFilteredTitle()}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-primary">
                    ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active)
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery.trim() ? 'Matching your search criteria' : 'Browse our complete collection'}
              </p>
            </div>
            
            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Suspense fallback={<FeedSkeleton layout={viewMode} count={20} />}>
            <InfiniteScrollFeed
              layout={viewMode}
              initialPostCount={20}
              postsPerPage={10}
              searchQuery={searchQuery.trim() || undefined}
              categoryFilter={selectedCategory !== 'all' ? selectedCategory : undefined}
              sortBy={sortBy}
              authorFilter={selectedAuthor !== 'all' ? selectedAuthor : undefined}
            />
          </Suspense>
        </div>
            </>
        )}
      </div>
    </div>
  )
}
