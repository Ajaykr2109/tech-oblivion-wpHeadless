
'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Search, Clock, Flame, Filter, Grid3X3, List, TrendingUp } from 'lucide-react'

import FeedSkeleton from '@/components/feed-skeleton'
import InfiniteScrollFeed from '@/components/infinite-scroll-feed'
import EnhancedBlogSearch from '@/components/enhanced-blog-search'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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

export default function BlogIndexPage({ 
  searchParams 
}: { 
  searchParams?: { q?: string } 
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams?.q || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('latest')
  const [selectedAuthor, setSelectedAuthor] = useState('all')
  const [categories, setCategories] = useState<Array<{ id: string, name: string, slug: string }>>([])
  const [authors, setAuthors] = useState<Array<{ id: string, name: string, slug: string }>>([])

  const hasSearchQuery = searchQuery && searchQuery.trim()

  // Fetch categories and authors for filters
  useEffect(() => {
    async function fetchFilterData() {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/wp/categories?per_page=20&hide_empty=true')
        if (categoriesRes.ok) {
          const categoriesData: Category[] = await categoriesRes.json()
          setCategories(categoriesData.map((cat) => ({
            id: cat.id.toString(),
            name: cat.name,
            slug: cat.slug
          })))
        }

        // Fetch authors
        const authorsRes = await fetch('/api/wp/users?per_page=20&has_published_posts[]=post')
        if (authorsRes.ok) {
          const authorsData: Author[] = await authorsRes.json()
          setAuthors(authorsData.map((author) => ({
            id: author.id.toString(),
            name: author.name,
            slug: author.slug
          })))
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
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
  }

  // Show active filters status
  const activeFiltersCount = [
    searchQuery.trim(),
    selectedCategory !== 'all' ? selectedCategory : '',
    sortBy !== 'latest' ? sortBy : '',
    selectedAuthor !== 'all' ? selectedAuthor : ''
  ].filter(Boolean).length

  const getFilteredTitle = () => {
    if (searchQuery.trim()) return `Search results for "${searchQuery}"`
    if (selectedCategory !== 'all') return `Articles in ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`
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
              <div className="lg:col-span-2 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  aria-label="Search articles" 
                  placeholder="Search articles, topics..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
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
                      <SelectItem key={author.id} value={author.slug}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Clear filters button */}
            {activeFiltersCount > 0 && (
              <div className="mt-3">
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
              </div>
            )}
          </div>
          
          {/* Quick filter tags */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground mr-2">Popular:</span>
            {['JavaScript', 'React', 'AI/ML', 'DevOps', 'UI/UX', 'Backend'].map((tag) => (
              <Button 
                key={tag} 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs h-7"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Button>
            ))}
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
          
          <Suspense fallback={<FeedSkeleton layout={viewMode} count={12} />}>
            <InfiniteScrollFeed
              layout={viewMode}
              initialPostCount={12}
              postsPerPage={6}
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
