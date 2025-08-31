'use client'
import React from 'react'
import PostEditorTile from './tiles/PostEditorTile'

type EditorInitial = { title?: string; content?: string; excerpt?: string; status?: string }

export default function PostEditorPageClient({ postId, initial }: { postId?: number; initial?: EditorInitial }) {
  // The tile already handles autosave/publish; this wrapper just provides full height container
  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      <PostEditorTile postId={postId} initial={initial} />
    </div>
  )
}
