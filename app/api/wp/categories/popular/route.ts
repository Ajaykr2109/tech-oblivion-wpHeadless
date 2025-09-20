import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type CategoryWithStats = {
  id: number
  name: string
  slug: string
  count: number
  description?: string
  parent?: number
  recentPostViews?: number
  averagePostViews?: number
}

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return NextResponse.json({ error: 'WP_URL missing' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 8), 1), 20)

  try {
    // Step 1: Get all categories with post counts
    const categoriesUrl = new URL('/wp-json/wp/v2/categories', WP)
    categoriesUrl.searchParams.set('per_page', '100')
    categoriesUrl.searchParams.set('hide_empty', 'true') // Only categories with posts
    categoriesUrl.searchParams.set('orderby', 'count')
    categoriesUrl.searchParams.set('order', 'desc')

    const categoriesRes = await fetch(categoriesUrl.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 } // Cache for 10 minutes
    })

    if (!categoriesRes.ok) {
      throw new Error(`Categories fetch failed: ${categoriesRes.status}`)
    }

    const categories: CategoryWithStats[] = await categoriesRes.json()

    // Step 2: Enhance categories with view statistics
    const enhancedCategories = await Promise.all(
      categories.slice(0, limit * 2).map(async (category) => {
        try {
          // Get recent posts from this category to calculate engagement
          const postsUrl = new URL('/wp-json/wp/v2/posts', WP)
          postsUrl.searchParams.set('categories', String(category.id))
          postsUrl.searchParams.set('per_page', '10')
          postsUrl.searchParams.set('orderby', 'date')
          postsUrl.searchParams.set('order', 'desc')

          const postsRes = await fetch(postsUrl.toString(), {
            headers: { Accept: 'application/json' },
            next: { revalidate: 300 }
          })

          let recentPostViews = 0
          let averagePostViews = 0

          if (postsRes.ok) {
            const posts = await postsRes.json()
            
            // Calculate engagement based on post metrics
            const now = Date.now()
            let totalViews = 0
            let viewsCount = 0

            for (const post of posts.slice(0, 5)) { // Check last 5 posts
              try {
                // Try to get view count from WordPress analytics
                const viewRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || req.url.split('/api')[0]}/api/wp/post-views/${post.id}`, {
                  next: { revalidate: 600 }
                })
                
                if (viewRes.ok) {
                  const viewData = await viewRes.json()
                  const views = viewData.views || viewData.view_count || 0
                  totalViews += views
                  viewsCount++
                  
                  // Weight recent posts more heavily
                  const postDate = new Date(post.date).getTime()
                  const daysSincePost = (now - postDate) / (1000 * 60 * 60 * 24)
                  const recencyWeight = Math.max(0.1, 1 / (1 + daysSincePost / 30)) // Decay over 30 days
                  recentPostViews += views * recencyWeight
                }
              } catch {
                // If view tracking fails, use post engagement metrics as fallback
                const postDate = new Date(post.date).getTime()
                const daysSincePost = (now - postDate) / (1000 * 60 * 60 * 24)
                
                // Estimate engagement from comment count, date, and category activity
                const commentCount = post.comment_count || 0
                const baseScore = Math.max(10, 50 - daysSincePost) // Fresher posts score higher
                const commentBonus = commentCount * 5
                const estimatedViews = baseScore + commentBonus
                
                totalViews += estimatedViews
                viewsCount++
                recentPostViews += estimatedViews * 0.5
              }
            }

            averagePostViews = viewsCount > 0 ? totalViews / viewsCount : 0
          }

          return {
            ...category,
            recentPostViews,
            averagePostViews,
          }
        } catch (error) {
          console.warn(`Failed to enhance category ${category.id}:`, error)
          return {
            ...category,
            recentPostViews: 0,
            averagePostViews: 0,
          }
        }
      })
    )

    // Step 3: Sort by engagement (combination of post count, recent views, and average views)
    const sortedCategories = enhancedCategories
      .filter(cat => cat.count > 0) // Only categories with posts
      .sort((a, b) => {
        // Calculate engagement score
        const scoreA = (a.count * 0.3) + (a.recentPostViews * 0.4) + (a.averagePostViews * 0.3)
        const scoreB = (b.count * 0.3) + (b.recentPostViews * 0.4) + (b.averagePostViews * 0.3)
        return scoreB - scoreA
      })
      .slice(0, limit)

    // Step 4: Format response
    const popularCategories = sortedCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
      description: cat.description || '',
      engagementScore: Math.round((cat.count * 0.3) + (cat.recentPostViews * 0.4) + (cat.averagePostViews * 0.3)),
      url: `/categories/${cat.slug}`
    }))

    return NextResponse.json({
      categories: popularCategories,
      total: popularCategories.length,
      lastUpdated: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' // Cache for 10 minutes
      }
    })

  } catch (error) {
    console.error('Popular categories error:', error)
    return NextResponse.json({
      error: 'Failed to fetch popular categories',
      categories: [],
      total: 0
    }, { status: 500 })
  }
}