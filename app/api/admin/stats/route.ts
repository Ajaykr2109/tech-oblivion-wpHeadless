import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) {
    return new Response(JSON.stringify({ error: 'WP_URL env required' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const incomingCookies = req.headers.get('cookie') || ''
    
    // Prepare Basic Auth headers for admin privileged access
    const basicUser = process.env.WP_USER
    const basicPass = process.env.WP_APP_PASSWORD
    let authHeaders: Record<string, string> = {}
    if (basicUser && basicPass) {
      const token = Buffer.from(`${basicUser}:${basicPass}`).toString('base64')
      authHeaders = { Authorization: `Basic ${token}` }
    }
    
    const createHeaders = () => ({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(incomingCookies ? { cookie: incomingCookies } : {}),
      ...authHeaders
    })
    
    // Fetch stats from WordPress in parallel
    const [postsRes, pagesRes, usersRes, , mediaRes, categoriesRes, tagsRes] = await Promise.all([
      // Posts
      fetch(`${WP}/wp-json/wp/v2/posts?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      
      // Pages  
      fetch(`${WP}/wp-json/wp/v2/pages?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      
      // Users
      fetch(`${WP}/wp-json/wp/v2/users?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      
      // Comments
      fetch(`${WP}/wp-json/wp/v2/comments?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      
      // Media
      fetch(`${WP}/wp-json/wp/v2/media?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      
      // Categories
      fetch(`${WP}/wp-json/wp/v2/categories?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      
      // Tags
      fetch(`${WP}/wp-json/wp/v2/tags?per_page=1&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
    ])

    const extractTotal = (response: Response): number => {
      const totalPosts = response.headers.get('X-WP-Total')
      return parseInt(totalPosts || '0', 10)
    }

    // Extract counts from headers
    const postsTotal = extractTotal(postsRes)
    const pagesTotal = extractTotal(pagesRes)
    const usersTotal = extractTotal(usersRes)
    // commentsTotal not used, we calculate it from individual statuses
    const mediaTotal = extractTotal(mediaRes)
    const categoriesTotal = extractTotal(categoriesRes)
    const tagsTotal = extractTotal(tagsRes)

    // Get detailed post status counts
    const [publishedPostsRes, draftPostsRes, pendingPostsRes] = await Promise.all([
      fetch(`${WP}/wp-json/wp/v2/posts?per_page=1&status=publish&_fields=id`, {
        headers: { 
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
      fetch(`${WP}/wp-json/wp/v2/posts?per_page=1&status=draft&_fields=id`, {
        headers: { 
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
      fetch(`${WP}/wp-json/wp/v2/posts?per_page=1&status=pending&_fields=id`, {
        headers: { 
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
    ])

    const publishedPosts = extractTotal(publishedPostsRes)
    const draftPosts = extractTotal(draftPostsRes)
    const pendingPosts = extractTotal(pendingPostsRes)

    // Get page status counts
    const [publishedPagesRes, draftPagesRes] = await Promise.all([
      fetch(`${WP}/wp-json/wp/v2/pages?per_page=1&status=publish&_fields=id`, {
        headers: { 
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
      fetch(`${WP}/wp-json/wp/v2/pages?per_page=1&status=draft&_fields=id`, {
        headers: { 
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
    ])

    const publishedPages = extractTotal(publishedPagesRes)
    const draftPages = extractTotal(draftPagesRes)

    // Get comment status counts (including trash)
    const [approvedCommentsRes, pendingCommentsRes, spamCommentsRes, trashCommentsRes] = await Promise.all([
      fetch(`${WP}/wp-json/wp/v2/comments?per_page=1&status=approve&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      fetch(`${WP}/wp-json/wp/v2/comments?per_page=1&status=hold&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      fetch(`${WP}/wp-json/wp/v2/comments?per_page=1&status=spam&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
      fetch(`${WP}/wp-json/wp/v2/comments?per_page=1&status=trash&_fields=id`, {
        headers: createHeaders(),
        cache: 'no-store',
      }),
    ])

    const approvedComments = extractTotal(approvedCommentsRes)
    const pendingComments = extractTotal(pendingCommentsRes)
    const spamComments = extractTotal(spamCommentsRes)
    const trashComments = extractTotal(trashCommentsRes)
    
    // Calculate total comments including all statuses
    const totalComments = approvedComments + pendingComments + spamComments + trashComments

    const stats = {
      posts: {
        total: postsTotal,
        published: publishedPosts,
        draft: draftPosts,
        pending: pendingPosts,
      },
      pages: {
        total: pagesTotal,
        published: publishedPages,
        draft: draftPages,
      },
      users: {
        total: usersTotal,
        admins: 0, // TODO: Calculate from user roles
        editors: 0,
        authors: 0,
      },
      comments: {
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
        spam: spamComments,
        trash: trashComments,
      },
      media: {
        total: mediaTotal,
        images: 0, // TODO: Calculate by mime type
        videos: 0,
        documents: 0,
      },
      categories: {
        total: categoriesTotal,
      },
      tags: {
        total: tagsTotal,
      },
    }

    return new Response(JSON.stringify(stats), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30' // Reduced to 30 seconds for admin dashboard responsiveness
      }
    })
    
  } catch (error) {
    console.error('Admin stats error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch admin stats', 
      detail: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}