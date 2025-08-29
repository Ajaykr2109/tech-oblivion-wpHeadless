'use client'

import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/fetcher'

type SearchItem = {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
}

function SearchResultsInner() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get('q') || ''
  const [results, setResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!searchQuery) {
        setResults([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<SearchItem[]>(`/api/wp/search?q=${encodeURIComponent(searchQuery)}`)
        if (!cancelled) setResults(data)
      } catch (e: any) {
        if (!cancelled) setError('Failed to load search results')
        console.error('Error fetching search results:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {searchQuery ? (
        <p>You searched for: <span className="font-medium">{searchQuery}</span></p>
      ) : (
        <p>Please enter a search query.</p>
      )}

      <div className="mt-8">
        {loading && <p>Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && results.length > 0 ? (
          <ul>
            {results.map((result) => (
              <li key={result.id} className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">
                  <Link href={`/blog/${result.slug}`}>{result.title?.rendered || 'Untitled'}</Link>
                </h2>
                {result.excerpt?.rendered && (
                  <div dangerouslySetInnerHTML={{ __html: result.excerpt.rendered }} />
                )}
              </li>
            ))}
          </ul>
        ) : (!loading && searchQuery) && <p>No results found for "{searchQuery}".</p>}
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading…</div>}>
      <SearchResultsInner />
    </Suspense>
  )
}