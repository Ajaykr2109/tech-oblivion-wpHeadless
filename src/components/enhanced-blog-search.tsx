"use client"

import React, { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/post-card'
import { calculatePostReadingTime, formatReadingTime } from '@/lib/reading-time'
import { htmlToText } from '@/lib/text'

type SearchResult = {
  type: 'post' | 'user' | 'profile'
  id: number
  title: string
  excerpt?: string
  slug: string
  url: string
  authorName?: string
  featuredImage?: string
  date?: string
}

type SearchResponse = {
  results: SearchResult[]
  total: number
  query: string
}

export default function EnhancedBlogSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [userResults, setUserResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize query from URL params
  useEffect(() => {
    const urlQuery = searchParams?.get('q') || ''
    setQuery(urlQuery)
    if (urlQuery) {
      performSearch(urlQuery)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      setTotalResults(0)
      return
    }

    setLoading(true)
    try {
      // Ask API for all types so we can section the results
      const response = await fetch(`/api/search/enhanced?q=${encodeURIComponent(searchQuery)}&limit=20`)
      if (response.ok) {
        const data: SearchResponse = await response.json()
        setResults(data.results.filter(r => r.type === 'post'))
        setUserResults(data.results.filter(r => r.type === 'user' || r.type === 'profile'))
        setTotalResults(data.total)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      // Update URL
      router.push(`/blog?q=${encodeURIComponent(trimmedQuery)}`)
      performSearch(trimmedQuery)
    }
  }

  const handleClear = () => {
    setQuery('')
  setResults([])
  setUserResults([])
    setTotalResults(0)
    router.push('/blog')
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles, topics, authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <Badge variant="secondary">
                {loading ? '...' : `${totalResults} result${totalResults !== 1 ? 's' : ''}`}
              </Badge>
            </div>
            {query && (
              <div className="text-sm text-muted-foreground">
                for "<span className="font-medium">{query}</span>"
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary rounded-lg h-48 mb-4" />
                  <div className="space-y-2">
                    <div className="bg-secondary rounded h-4 w-3/4" />
                    <div className="bg-secondary rounded h-3 w-full" />
                    <div className="bg-secondary rounded h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Articles section */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => {
                // Convert search result to PostCard format
                const readingTime = calculatePostReadingTime(result.title, result.excerpt || '')
                return (
                  <PostCard
                    key={result.id}
                    layout="grid"
                    showFeatured={false}
                    post={{
                      id: String(result.id),
                      title: result.title,
                      author: result.authorName || 'Unknown',
                      authorSlug: undefined,
                      avatar: '/favicon.ico',
                      imageUrl: result.featuredImage || '/favicon.ico',
                      imageHint: 'featured image',
                      excerpt: htmlToText(result.excerpt || '').slice(0, 180),
                      slug: result.slug,
                      date: result.date || '',
                      content: result.excerpt || '',
                      readingTime: formatReadingTime(readingTime),
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* Users/Authors section */}
          {!loading && userResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-base font-semibold mb-3">Authors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => router.push(u.url)}
                    className="flex items-center gap-3 rounded-lg border p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-secondary" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.title}</div>
                      <div className="text-xs text-muted-foreground truncate">Author Profile</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any articles matching "<span className="font-medium">{query}</span>".
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Try searching for:</p>
                <ul className="space-y-1">
                  <li>• Different keywords or phrases</li>
                  <li>• Broader terms</li>
                  <li>• Author names or topics</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}