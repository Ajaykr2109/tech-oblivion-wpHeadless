import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProfilePage from '@/components/profile/ProfilePage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Types for the public user API
export interface PublicUserProfile {
  id: number
  name: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, string | number | boolean | null>
  recent_posts: Array<{
    id: number
    title: string
    slug: string
    date: string
    link: string
    content_raw: string
    content_rendered: string
  }>
  recent_comments: Array<{
    id: number
    post: number
    date: string
    link: string
    content_raw: string
    content_rendered: string
  }>
}

async function fetchPublicUser(slug: string): Promise<PublicUserProfile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  // Use internal Next API which proxies to MU endpoint
  const url = `${baseUrl}/api/wp/users/${encodeURIComponent(slug)}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as PublicUserProfile | null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const user = await fetchPublicUser(slug)
  if (!user) return { title: 'Profile', description: 'User profile' }
  const avatar = user.avatar_urls ? (user.avatar_urls['512'] || user.avatar_urls['256'] || user.avatar_urls['96'] || Object.values(user.avatar_urls)[0]) : undefined
  const title = `Profile of ${user.name}`
  const description = user.description || `View ${user.name}'s profile, posts, and comments.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: avatar ? [{ url: avatar }] : undefined,
      type: 'profile'
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: avatar ? [avatar] : undefined
    }
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await fetchPublicUser(slug)
  if (!user) return notFound()
  return <ProfilePage user={user} />
}
