import React from 'react'

import { PostCardSkeleton } from '@/components/post-card-skeleton'

export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
