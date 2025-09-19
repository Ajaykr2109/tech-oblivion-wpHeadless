"use client"
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommentsProvider } from '@/components/comments/CommentsProvider'
import CommentEditor from '@/components/comments/CommentEditor'
import CommentList from '@/components/comments/CommentList'
import AdminBulkBar from '@/components/comments/AdminBulkBar'

export default function CommentsSection({ postId }: { postId: number }) {
  return (
    <CommentsProvider postId={postId}>
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CommentEditor />
          <CommentList />
        </CardContent>
      </Card>
      <AdminBulkBar />
    </CommentsProvider>
  )
}
