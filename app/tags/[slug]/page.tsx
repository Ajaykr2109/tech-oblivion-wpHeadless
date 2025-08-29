import Feed from '@/components/feed'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Tag: <span className="capitalize">{slug.replace(/-/g, ' ')}</span></h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Browsing all articles tagged with "{slug}".
        </p>
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-card/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search within this tag..." className="pl-10" />
            </div>
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full">Apply Filters</Button>
        </div>
      </div>
      
      <Feed layout="grid" postCount={6} />
      
    </div>
  )
}
