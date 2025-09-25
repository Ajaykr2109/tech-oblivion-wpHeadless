import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type SearchResult = {
  type: 'post' | 'user' | 'profile'
  id: number
  title: string
  excerpt?: string
  contentHtml?: string
  slug: string
  url: string
  authorName?: string
  featuredImage?: string
  date?: string
}

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) return NextResponse.json({ error: 'WP_URL missing' }, { status: 500 })
  
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all' // 'all', 'posts', 'users'
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)
  
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 }, { status: 200 })
  }

  const results: SearchResult[] = []

  try {
    // Search posts
    if (type === 'all' || type === 'posts') {
      const postsUrl = new URL('/wp-json/wp/v2/posts', WP)
      postsUrl.searchParams.set('search', q)
      postsUrl.searchParams.set('per_page', String(Math.ceil(limit * 0.7))) // 70% of results for posts
      postsUrl.searchParams.set('_embed', '1')
      postsUrl.searchParams.set('status', 'publish')
      
      const postsRes = await fetch(postsUrl.toString(), {
        headers: { 
          'Accept': 'application/json', 
          'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)' 
        },
        next: { revalidate: 60 } // Cache for 1 minute
      })
      
      if (postsRes.ok) {
        const posts = await postsRes.json()
        posts.forEach((post: {
          id: number;
          title?: { rendered: string };
          excerpt?: { rendered: string };
          content?: { rendered: string };
          slug: string;
          date: string;
          _embedded?: {
            author?: Array<{ name: string }>;
            'wp:featuredmedia'?: Array<{ source_url: string }>;
          };
        }) => {
          results.push({
            type: 'post',
            id: post.id,
            title: post.title?.rendered || '',
            excerpt: post.excerpt?.rendered?.replace(/<[^>]+>/g, '').substring(0, 150) + '...' || '',
            contentHtml: post.content?.rendered || '',
            slug: post.slug,
            url: `/blog/${post.slug}`,
            authorName: post._embedded?.author?.[0]?.name || '',
            featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
            date: post.date
          })
        })
      }
    }

    // Search users/profiles
    if (type === 'all' || type === 'users') {
      const usersUrl = new URL('/wp-json/wp/v2/users', WP)
      usersUrl.searchParams.set('search', q)
      usersUrl.searchParams.set('per_page', String(Math.floor(limit * 0.3))) // 30% of results for users
      usersUrl.searchParams.set('has_published_posts', 'true') // Only users with published posts
      
      const usersRes = await fetch(usersUrl.toString(), {
        headers: { 
          'Accept': 'application/json', 
          'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)' 
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      
      if (usersRes.ok) {
        const users = await usersRes.json()
        users.forEach((user: {
          id: number;
          name?: string;
          display_name?: string;
          username?: string;
          slug?: string;
          description?: string;
          post_count?: number;
          avatar_urls?: Record<string, string>;
        }) => {
          results.push({
            type: 'user',
            id: user.id,
            title: user.name || user.display_name || user.username || 'Unknown User',
            excerpt: user.description || `Author with ${user.post_count || 0} published posts`,
            slug: user.slug || user.username || `user-${user.id}`,
            url: `/profile/${user.slug || user.username || `user-${user.id}`}`,
            authorName: user.name,
            featuredImage: user.avatar_urls?.['96'] || ''
          })
        })
      }
    }

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ 
      error: 'Search failed', 
      results: [], 
      total: 0 
    }, { status: 500 })
  }

  // Sort results by relevance (posts first, then users)
  results.sort((a, b) => {
    if (a.type === 'post' && b.type === 'user') return -1
    if (a.type === 'user' && b.type === 'post') return 1
    return 0
  })

  return NextResponse.json({
    results: results.slice(0, limit),
    total: results.length,
    query: q
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
    }
  })
}