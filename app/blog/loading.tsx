import React from 'react'
import FeedSkeleton from '@/components/feed-skeleton'

// Minimal loading UI for the /blog index route
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="h-8 w-64 mx-auto bg-muted rounded animate-pulse" />
        <div className="mt-3 h-4 w-80 mx-auto bg-muted rounded animate-pulse" />
      </div>
      <FeedSkeleton layout="grid" count={6} />
    </div>
  )
}
