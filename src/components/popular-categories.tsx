'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  count: number
  description: string
  engagementScore: number
  url: string
}

interface PopularCategoriesResponse {
  categories: Category[]
  total: number
  lastUpdated: string
}

interface PopularCategoriesProps {
  limit?: number
  showCount?: boolean
  className?: string
}

export default function PopularCategories({ 
  limit = 6, 
  showCount = true, 
  className = '' 
}: PopularCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPopularCategories() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/wp/categories/popular?limit=${limit}`, {
          next: { revalidate: 600 } // Cache for 10 minutes
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        
        const data: PopularCategoriesResponse = await response.json()
        setCategories(data.categories || [])
      } catch (err) {
        console.error('Error fetching popular categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to load categories')
        
        // Fallback to static data if API fails
        setCategories([
          { id: 1, name: "Technology", slug: "technology", count: 45, description: "", engagementScore: 120, url: "/categories/technology" },
          { id: 2, name: "Programming", slug: "programming", count: 38, description: "", engagementScore: 110, url: "/categories/programming" },
          { id: 3, name: "Tutorials", slug: "tutorials", count: 32, description: "", engagementScore: 95, url: "/categories/tutorials" },
          { id: 4, name: "Reviews", slug: "reviews", count: 28, description: "", engagementScore: 85, url: "/categories/reviews" },
          { id: 5, name: "Tips & Tricks", slug: "tips-tricks", count: 25, description: "", engagementScore: 75, url: "/categories/tips-tricks" },
          { id: 6, name: "Industry News", slug: "industry-news", count: 22, description: "", engagementScore: 65, url: "/categories/industry-news" }
        ].slice(0, limit))
      } finally {
        setLoading(false)
      }
    }

    fetchPopularCategories()
  }, [limit])

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-green-100 text-green-800 hover:bg-green-200",
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-orange-100 text-orange-800 hover:bg-orange-200"
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className={`popular-categories ${className}`}>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: limit }, (_, i) => (
            <div
              key={i}
              className="inline-block px-3 py-1.5 text-sm rounded-full bg-gray-200 animate-pulse"
            >
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className={`popular-categories ${className}`}>
        <div className="text-sm text-gray-500">
          Popular categories temporarily unavailable
        </div>
      </div>
    )
  }

  return (
    <div className={`popular-categories ${className}`}>
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={category.url}
            className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${getCategoryColor(index)}`}
            title={category.description || `Browse ${category.name} posts`}
          >
            <span className="flex items-center gap-1">
              {category.name}
              {showCount && (
                <span className="text-xs opacity-75">
                  ({category.count})
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
      
      {error && (
        <div className="text-xs text-gray-400 mt-2">
          Showing cached categories (API: {error})
        </div>
      )}
    </div>
  )
}