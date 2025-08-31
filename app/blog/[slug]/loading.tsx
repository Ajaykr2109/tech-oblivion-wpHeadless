import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPostLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <header className="text-center mb-8 relative">
        <div className="absolute top-0 right-0">
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
        <div className="flex justify-center items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <span>•</span>
          <Skeleton className="h-4 w-24" />
          <span>•</span>
          <Skeleton className="h-4 w-16" />
        </div>
      </header>

      <div className="relative w-full max-w-4xl mx-auto mb-12">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 lg:sticky top-8 self-start hidden lg:block">
          <div className="p-4 border-l-4 border-primary bg-secondary/50 rounded-r-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </aside>

        <article className="lg:col-span-6">
          <div className="prose dark:prose-invert max-w-none mx-auto">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </article>

        <aside className="lg:col-span-3 lg:sticky top-8 self-start">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </aside>
      </div>

      <div className="my-12">
        <Skeleton className="h-px w-full" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-card/50 p-6 rounded-lg flex flex-col sm:flex-row items-start gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      <div className="my-12">
        <Skeleton className="h-px w-full" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-6">
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
