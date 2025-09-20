import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { PostCardSkeleton } from '@/components/post-card-skeleton'

export default function RootLoading() {
  return (
    <main className="min-h-screen">
      {/* TOP SECTION - VIDEO AND BLOGS SKELETON */}
      <section className="py-6 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-stretch">
            {/* Left Column - Latest Video Skeleton */}
            <div className="flex flex-col h-[400px] lg:h-[600px] overflow-hidden">
              <div className="flex items-center gap-3 mb-3 lg:mb-4 flex-shrink-0">
                <div>
                  <Skeleton className="h-6 w-28 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            </div>
            
            {/* Right Column - Recent Articles Skeleton */}
            <div className="flex flex-col h-[400px] lg:h-[600px] overflow-hidden">
              <div className="flex items-center gap-3 mb-3 lg:mb-4 flex-shrink-0">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* FEATURED CONTENT SKELETON */}
        <section className="py-16 bg-secondary/30 rounded-2xl">
          <div className="px-6 md:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-6 w-32 mx-auto mb-4 rounded-full" />
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ALL ARTICLES SECTION SKELETON */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* COMMUNITY CTA SECTION SKELETON */}
        <section className="py-16">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/20 rounded-2xl p-8 md:p-12 text-center border border-border/50">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-12 w-12 mx-auto mb-6 rounded" />
              <Skeleton className="h-10 w-64 mx-auto mb-6" />
              <Skeleton className="h-6 w-full mx-auto mb-4" />
              <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
              
              <div className="flex justify-center gap-4 flex-wrap mb-8">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-32" />
              </div>
              
              <div className="flex items-center justify-center gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
