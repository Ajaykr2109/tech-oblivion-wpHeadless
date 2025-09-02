import Link from 'next/link'
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { cookies } from 'next/headers'

type SearchItem = {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
}
async function fetchSearch(q: string, cookieHeader: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '')
  const r = await fetch(`${base}/api/wp/search?q=${encodeURIComponent(q)}`, {
    headers: { Accept: 'application/json', ...(cookieHeader ? { cookie: cookieHeader } : {}) },
    cache: 'no-store',
  })
  if (!r.ok) throw new Error('Failed')
  return (await r.json()) as SearchItem[]
}

function Client({ q }: { q: string }) {
  const query = useQuery({
    queryKey: ['search', q],
    queryFn: async () => fetchSearch(q, ''),
    enabled: !!q,
  })
  const results = query.data || []
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {q ? <p>You searched for: <span className="font-medium">{q}</span></p> : <p>Please enter a search query.</p>}
      <div className="mt-8">
        {query.isLoading && <p>Loading…</p>}
        {query.isError && <p className="text-red-500">Failed to load search results</p>}
        {!query.isLoading && !query.isError && results.length > 0 ? (
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
        ) : (!query.isLoading && q) && <p>No results found for "{q}".</p>}
      </div>
    </div>
  )
}

export default async function SearchResultsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q || '').trim()
  const cookieHeader = cookies().toString()
  const qc = new QueryClient()
  if (q) {
    await qc.prefetchQuery({ queryKey: ['search', q], queryFn: () => fetchSearch(q, cookieHeader) })
  }
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading…</div>}>
        <Client q={q} />
      </Suspense>
    </HydrationBoundary>
  )
}