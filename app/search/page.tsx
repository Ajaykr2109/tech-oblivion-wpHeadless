import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { Suspense } from 'react'
import { cookies } from 'next/headers'

import SearchClient from './SearchClient'

type EnhancedResponse = { results: Array<unknown>; total: number; query: string }

async function fetchSearch(q: string, cookieHeader: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '')
  const r = await fetch(`${base}/api/search/enhanced?q=${encodeURIComponent(q)}&limit=30`, {
    headers: { Accept: 'application/json', ...(cookieHeader ? { cookie: cookieHeader } : {}) },
    cache: 'no-store',
  })
  if (!r.ok) throw new Error('Failed')
  return (await r.json()) as EnhancedResponse
}

export default async function SearchResultsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q || '').trim()
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${encodeURIComponent(c.value)}`).join('; ')
  const qc = new QueryClient()
  if (q.length >= 2) {
    await qc.prefetchQuery({ queryKey: ['enhanced-search', q], queryFn: () => fetchSearch(q, cookieHeader) })
  }
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading…</div>}>
        {/* Client component handles UX, ESC, tabs */}
        <SearchClient q={q} />
      </Suspense>
    </HydrationBoundary>
  )
}