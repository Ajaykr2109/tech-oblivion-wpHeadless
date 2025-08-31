import React from 'react'

import { cn } from '@/lib/utils'

import { PostCardSkeleton } from './post-card-skeleton'

export default function FeedSkeleton({ layout = 'grid', count = 6 }: { layout?: 'grid' | 'list'; count?: number }) {
  const wrapperClass = cn(
    'grid gap-6',
    layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
  )

  return (
    <div className={wrapperClass} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
