"use client"

import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

import PostActionsMenu from './PostActionsMenu'

interface PostActionsWrapperProps {
  postId: number
  slug: string
  title: string
  authorId?: number
}

export default function PostActionsWrapper({ postId, slug, title, authorId }: PostActionsWrapperProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <Skeleton className="w-8 h-8 rounded" />
  }

  const post = {
    id: postId,
    author_id: authorId,
    title,
    slug
  }

  const legacyUser = user ? {
    id: parseInt(user.id) || 0, // Convert string id to number for legacy compatibility
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    url: user.url,
    website: user.website,
    roles: user.roles || [],
  } : null

  return (
    <PostActionsMenu 
      post={post}
      user={legacyUser}
      className="border-0"
    />
  )
}
