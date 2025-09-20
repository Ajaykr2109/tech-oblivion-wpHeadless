'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Info, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { htmlToText } from '@/lib/text'
import { calculatePostReadingTime, formatReadingTime } from '@/lib/reading-time'

import { PostCard } from './post-card'

interface Post {
  id: number
  title: string
  slug: string
  date: string
  contentHtml?: string
  excerptHtml?: string
  featuredImage?: string
  authorName?: string
  authorSlug?: string
  authorAvatar?: string
}

interface PostsResponse {
  items: Post[]
  hasMore: boolean
  nextPage: number
}

interface InfiniteScrollFeedProps {
  layout?: 'grid' | 'list' | 'simple'
  initialPostCount?: number
  postsPerPage?: number
  searchQuery?: string
  categoryFilter?: string
  sortBy?: 'latest' | 'popular' | 'trending'
  authorFilter?: string
}

// Module-level cache to avoid hook deps churn and share across instances
interface GlobalWithCache {
  __TO_FEED_CACHE__?: Map<string, PostsResponse>
}

const globalWithCache = globalThis as GlobalWithCache
const FEED_CACHE: Map<string, PostsResponse> = globalWithCache.__TO_FEED_CACHE__ || new Map<string, PostsResponse>()
globalWithCache.__TO_FEED_CACHE__ = FEED_CACHE

export default function InfiniteScrollFeed({
  layout = 'grid',
  initialPostCount = 12,
  postsPerPage = 6,
  searchQuery,
  categoryFilter,
  sortBy = 'latest',
  authorFilter
}: InfiniteScrollFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Fetch posts function
  const fetchPosts = useCallback(async (page: number): Promise<PostsResponse> => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('per_page', page === 1 ? initialPostCount.toString() : postsPerPage.toString())
    
    if (searchQuery) params.set('search', searchQuery)
  // Filters expect numeric IDs; forward if provided
  if (categoryFilter && categoryFilter !== 'all') params.set('categories', categoryFilter)
  if (authorFilter && authorFilter !== 'all') params.set('author', authorFilter)
    
    // Map sortBy to API parameters
    switch (sortBy) {
      case 'popular':
        // WordPress REST API doesn't support meta_value_num orderby
        // Fall back to date ordering for now
        params.set('orderby', 'date')
        params.set('order', 'desc')
        break
      case 'trending':
        params.set('orderby', 'comment_count')
        params.set('order', 'desc')
        break
      default: // latest
        params.set('orderby', 'date')
        params.set('order', 'desc')
    }

  // Always embed related resources so we get author and featured media
  params.set('_embed', '1')
  // Force fresh data - no caching
  params.set('_t', Date.now().toString())
  // Build a stable cache key
  const cacheKey = JSON.stringify({ page, initialPostCount, postsPerPage, searchQuery: searchQuery || '', categoryFilter: categoryFilter || '', sortBy, authorFilter: authorFilter || '' })
  if (FEED_CACHE.has(cacheKey)) {
    return FEED_CACHE.get(cacheKey) as PostsResponse
  }

  const response = await fetch(`/api/wp/posts?${params}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  })
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const data = await response.json()
    
    // The API may return one of:
    // 1) Raw WP array of posts
    // 2) Object with `posts` or `items`
    // Normalize to our Post[] shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapWPPost = (p: any): Post => {
    const mapped = {
      id: Number(p.id),
      title: p?.title?.rendered || p?.title || '',
      slug: p?.slug || '',
      date: p?.date || new Date().toISOString(),
      contentHtml: p?.content?.rendered || p?.contentHtml,
      excerptHtml: p?.excerpt?.rendered || p?.excerptHtml,
      featuredImage:
        p?.featuredImage ||
        p?.featured_media_url ||
        p?.jetpack_featured_media_url ||
        p?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        undefined,
      authorName:
        p?.authorName ||
        p?._embedded?.author?.[0]?.name ||
        p?.author_info?.display_name ||
        undefined,
      authorSlug:
        p?.authorSlug ||
        p?._embedded?.author?.[0]?.slug ||
        p?.author_info?.user_nicename ||
        undefined,
      authorAvatar:
        p?.authorAvatar ||
        p?._embedded?.author?.[0]?.avatar_urls?.['48'] ||
        p?._embedded?.author?.[0]?.avatar_urls?.['96'] ||
        p?.author_info?.avatar ||
        undefined,
    }
    
    return mapped
  }

    let posts: Post[] = []
    if (Array.isArray(data)) {
      posts = data.map(mapWPPost)
    } else if (Array.isArray(data?.posts)) {
      // Might already be in our simplified shape; map defensively
      posts = data.posts.map(mapWPPost)
    } else if (Array.isArray(data?.items)) {
      posts = data.items.map(mapWPPost)
    } else {
      posts = []
    }
    
    const normalized: PostsResponse = {
      items: posts,
      hasMore: posts.length === (page === 1 ? initialPostCount : postsPerPage),
      nextPage: page + 1
    }
    FEED_CACHE.set(cacheKey, normalized)
    return normalized
  }, [searchQuery, categoryFilter, sortBy, authorFilter, initialPostCount, postsPerPage])

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      setError(null)
      
      const { items, hasMore: moreAvailable, nextPage } = await fetchPosts(currentPage)
      
      setPosts(prev => [...prev, ...items])
      setHasMore(moreAvailable)
      setCurrentPage(nextPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, currentPage, fetchPosts])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMorePosts()
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px' // Start loading 100px before the element comes into view
    })
    
    if (node) observerRef.current.observe(node)
  }, [loadingMore, hasMore, loadMorePosts])

  // Initial load
  useEffect(() => {
    async function loadInitialPosts() {
      try {
        setLoading(true)
        setError(null)
        
        const { items, hasMore: moreAvailable, nextPage } = await fetchPosts(1)
        setPosts(items)
        setHasMore(moreAvailable)
        setCurrentPage(nextPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    loadInitialPosts()
  }, [fetchPosts])

  // When filters affecting fetch change, show a subtle overlay instead of bright skeletons
  useEffect(() => {
    const hasPosts = posts.length > 0
    if (!loading && hasPosts) {
      setIsTransitioning(true)
      const t = setTimeout(() => setIsTransitioning(false), 200)
      return () => clearTimeout(t)
    }
  }, [searchQuery, categoryFilter, sortBy, authorFilter, loading, posts.length])

  const wrapperClass = cn(
    'grid',
    // Show 5 cards per row on wide screens, downscale responsively
    layout === 'grid'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
      : layout === 'simple'
      ? 'grid-cols-1 gap-2'
      : 'grid-cols-1 gap-4'
  )

  if (loading) {
    return (
      <div className={wrapperClass}>
        {Array.from({ length: initialPostCount }, (_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-48 w-full rounded-lg bg-muted/70 dark:bg-muted/50 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] mb-4"></div>
            <div className="h-4 rounded bg-muted/70 dark:bg-muted/50 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] mb-2"></div>
            <div className="h-4 w-3/4 rounded bg-muted/70 dark:bg-muted/50 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="col-span-full border rounded-md p-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <Info className="h-4 w-4" />
        </div>
        <p className="mb-1 font-medium text-foreground">Failed to load posts</p>
        <p>{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-full border rounded-md p-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <Info className="h-4 w-4" />
        </div>
        <p className="mb-1 font-medium text-foreground">No posts found</p>
        <p>
          {searchQuery ? `No posts match "${searchQuery}"` : 
           categoryFilter ? `No posts in this category` :
           'Posts will appear once published. Please check back soon.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={cn(wrapperClass, 'relative')}>
        {isTransitioning && (
          <div className="pointer-events-none absolute inset-0 z-[1] bg-background/40 backdrop-blur-[1px] transition-opacity duration-200" />
        )}
        {posts.map((post, index) => {
          // Calculate reading time from full content, fallback to excerpt
          const contentForReading = post.contentHtml || post.excerptHtml || ''
          const readingTime = calculatePostReadingTime(
            post.title,
            contentForReading
          )
          
          const isLastPost = index === posts.length - 1
          
          return (
            <div
              key={post.id}
              ref={isLastPost ? lastPostElementRef : null}
            >
              <PostCard
                layout={layout}
                showFeatured={false}
                post={{
                  id: String(post.id),
                  title: post.title,
                  author: post.authorName || 'Unknown',
                  authorSlug: post.authorSlug || undefined,
                  avatar: post.authorAvatar || '/favicon.ico',
                  imageUrl: post.featuredImage || '/favicon.ico',
                  imageHint: 'featured image',
                  excerpt: htmlToText(post.excerptHtml || '').slice(0, 180),
                  slug: post.slug,
                  date: post.date,
                  content: contentForReading,
                  readingTime: formatReadingTime(readingTime),
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Loading indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading more posts...</span>
        </div>
      )}

      {/* Error indicator */}
      {error && !loadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Failed to load more posts</p>
            <button
              onClick={loadMorePosts}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-muted-foreground">
            You've reached the end of the posts
          </span>
        </div>
      )}
    </>
  )
}