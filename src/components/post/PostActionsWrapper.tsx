"use client"

import { useEffect, useState } from 'react'

import type { User } from '@/lib/auth'

import PostActionsMenu from './PostActionsMenu'

interface PostActionsWrapperProps {
  postId: number
  slug: string
  title: string
  authorId?: number
}

export default function PostActionsWrapper({ postId, slug, title, authorId }: PostActionsWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { 
          cache: 'no-store',
          credentials: 'include' 
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="w-8 h-8 bg-muted animate-pulse rounded" />
    )
  }

  const post = {
    id: postId,
    author_id: authorId,
    title,
    slug
  }

  return (
    <PostActionsMenu 
      post={post}
      user={user}
      className="border-0"
    />
  )
}
