
import React, { Suspense } from 'react'
import { Search, Clock, Flame, Filter, Grid3X3, List, TrendingUp, BookOpen } from 'lucide-react'

import Feed from '@/components/feed'
import FeedSkeleton from '@/components/feed-skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-static'

export default async function BlogIndexPage() {
  return (
    <div className="min-h-screen">
      {/* Clean Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-secondary/20 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              Knowledge Library
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Articles & <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Explore in-depth tutorials, practical guides, and expert insights from our community of developers and tech enthusiasts.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Clean Filters Section */}
        <div className="bg-card border rounded-xl p-6 mb-8 sticky top-20 z-30">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Find Content</h3>
                <p className="text-xs text-muted-foreground">Search and filter articles</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  aria-label="Search articles" 
                  placeholder="Search articles, topics..." 
                  className="pl-9" 
                />
              </div>
              
              {/* Category filter */}
              <Select>
                <SelectTrigger aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ai">AI & Machine Learning</SelectItem>
                  <SelectItem value="web-dev">Web Development</SelectItem>
                  <SelectItem value="react">React & Frontend</SelectItem>
                  <SelectItem value="backend">Backend & DevOps</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort filter */}
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
                  <SelectItem value="trending">
                    <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Trending</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Quick filter tags */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground mr-2">Popular:</span>
            {['JavaScript', 'React', 'AI/ML', 'DevOps', 'UI/UX', 'Backend'].map((tag) => (
              <Button 
                key={tag} 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs h-7"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
        
        {/* All Articles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">All Articles</h2>
              <p className="text-muted-foreground">Browse our complete collection</p>
            </div>
            
            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Suspense fallback={<FeedSkeleton layout="grid" count={12} />}>
            <Feed layout="grid" postCount={12} />
          </Suspense>
        </div>
        
        {/* Load More */}
        <div className="text-center">
          <Button size="lg" variant="outline">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  )
}
