"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PostExcerpt from './PostExcerpt'

export type CommentItem = {
  id: number
  post: number
  date: string
  link: string
  content_raw: string
  content_rendered: string
}

export default function CommentsList({ comments, clampPx }: { comments: CommentItem[]; clampPx?: number }) {
  if (!comments || comments.length === 0) {
    return (
      <Card className="rounded-2xl shadow">
        <CardContent className="p-8 text-center text-muted-foreground">No activity yet</CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6">
      {comments.map((c) => (
        <a key={c.id} href={c.link} target="_blank" rel="noopener noreferrer">
          <Card className="rounded-2xl shadow transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Comment on post #{c.post}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <PostExcerpt html={c.content_rendered} clampPx={clampPx} />
              <div className="mt-3 text-sm text-muted-foreground">{c.date}</div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}
