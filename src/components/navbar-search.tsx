"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, User, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { decodeEntities } from '@/lib/entities'

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

export default function NavbarSearch() {
  // Toggle whether inline suggestions are shown while typing. We prefetch regardless to warm cache.
  const SHOW_INLINE_RESULTS = false
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounced search function
  const searchFunction = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      // Don't show the results panel or "no results" until the user submits or has enough chars
      setShowResults(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search/enhanced?q=${encodeURIComponent(searchQuery)}&limit=8`)
      if (response.ok) {
        const data: SearchResponse = await response.json()
        // Soft-decode entities for nicer display
        const normalized = (data.results || []).map(r => ({
          ...r,
          title: decodeEntities(r.title || ''),
          excerpt: r.excerpt ? decodeEntities(r.excerpt) : r.excerpt,
        }))
        setResults(normalized)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query && query.length >= 2) {
        // Only fetch suggestions after 2+ chars, but still don't redirect.
        searchFunction(query)
      } else if (!query) {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchFunction])

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setShowResults(false)
      }
      if (event.key === '/' && event.metaKey) {
        event.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    handleClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      handleClose()
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />
      case 'user':
        return <User className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div ref={searchRef} className="relative h-9 w-9">
      {/* Search Trigger Button stays mounted to preserve layout */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className={`h-9 w-9 rounded-lg hover:bg-secondary/80 transition-opacity ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Inline overlay anchored to navbar; no layout shift */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 320 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 origin-right"
          >
            <div className="bg-background border rounded-lg shadow-lg overflow-hidden w-[320px]">
              <form onSubmit={handleSubmit} className="flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search articles, authors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {loading && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>

              {/* Search Results */}
              <AnimatePresence>
                {SHOW_INLINE_RESULTS && showResults && results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="border-t max-h-96 overflow-y-auto"
                  >
                    {results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-3 text-left hover:bg-secondary/50 transition-colors border-b last:border-b-0 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 p-1 rounded bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {result.title}
                            </div>
                            {result.excerpt && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {result.excerpt}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {result.type === 'post' && result.authorName && (
                                <>
                                  <span>by {result.authorName}</span>
                                  {result.date && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(result.date).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                                </>
                              )}
                              {result.type === 'user' && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Author Profile
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {query && (
                      <div className="p-3 border-t bg-secondary/20">
                        <Link
                          href={`/search?q=${encodeURIComponent(query)}`}
                          onClick={handleClose}
                          className="text-sm text-primary hover:underline"
                        >
                          View all results for "{query}"
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No premature empty-state: only after 2+ chars AND a completed fetch */}
              {SHOW_INLINE_RESULTS && showResults && query.length >= 2 && results.length === 0 && !loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}