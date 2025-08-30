
import React, { Suspense } from 'react'
import Feed from '@/components/feed'
import FeedSkeleton from '@/components/feed-skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Clock, Flame } from 'lucide-react'

export const dynamic = 'force-static'

export default async function BlogIndexPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Articles & Insights</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore the latest in web development, AI, and technology.
        </p>
      </div>

      {/* Sticky search + filters */}
      <div className="sticky top-16 z-30 mb-8 border-y bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="py-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input aria-label="Search articles" placeholder="Search articles by keyword..." className="pl-10" />
            </div>
            {/* Category filter */}
            <Select>
              <SelectTrigger aria-label="Filter by category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="web-dev">Web Development</SelectItem>
                <SelectItem value="react">React</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort filter with icons */}
            <Select>
              <SelectTrigger aria-label="Sort by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Latest</span>
                </SelectItem>
                <SelectItem value="popular">
                  <span className="flex items-center gap-2"><Flame className="h-4 w-4" /> Popular</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<FeedSkeleton layout="grid" count={6} />}>
        {/* Server component fetch with skeleton fallback */}
        <Feed layout="grid" postCount={6} />
      </Suspense>
      
    </div>
  )
}
