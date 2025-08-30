"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PostExcerpt from './PostExcerpt'

export type PostItem = {
  id: number
  title: string
  slug: string
  date: string
  link: string
  content_raw: string
  content_rendered: string
}

export default function PostsList({ posts, clampPx }: { posts: PostItem[]; clampPx?: number }) {
  if (!posts || posts.length === 0) {
    return (
      <Card className="rounded-2xl shadow">
        <CardContent className="p-8 text-center text-muted-foreground">No activity yet</CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((p) => (
        <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
          <Card className="rounded-2xl shadow transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <PostExcerpt html={p.content_rendered} clampPx={clampPx} />
              <div className="mt-3 text-sm text-muted-foreground">{p.date}</div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}
