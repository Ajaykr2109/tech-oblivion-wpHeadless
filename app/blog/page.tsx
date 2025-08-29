
import React from 'react'
import { getPosts, PostSummary } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'
import Feed from '@/components/feed'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

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

      <div className="mb-8 p-4 border rounded-lg bg-card/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="web-dev">Web Development</SelectItem>
              <SelectItem value="react">React</SelectItem>
            </SelectContent>
          </Select>
           <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              <SelectItem value="jane-doe">Jane Doe</SelectItem>
              <SelectItem value="john-smith">John Smith</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full">Apply Filters</Button>
        </div>
      </div>
      
      <Feed layout="grid" postCount={6} />
      
    </div>
  )
}
