"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const PostsTabClient = dynamic(() => import('./PostsTabClient'))
const CommentsTabClient = dynamic(() => import('./CommentsTabClient'))

export type PublicUserProfile = {
  id: number
  name: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  roles?: string[]
  profile_fields?: Record<string, any>
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

export default function ProfilePage({ user }: { user: PublicUserProfile }) {
  const router = useRouter()

  const avatar = useMemo(() => {
    const urls = user.avatar_urls || {}
    return urls['512'] || urls['256'] || urls['96'] || Object.values(urls)[0]
  }, [user.avatar_urls])

  const hasPosts = (user.recent_posts?.length || 0) > 0
  const wpBase = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '')
  const authorArchive = hasPosts ? `${wpBase}/author/${encodeURIComponent(user.slug)}/` : null

  const joined = typeof (user as any)?.profile_fields?.registered === 'string' ? (user as any).profile_fields.registered : null

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="mb-3">
          <Button variant="ghost" size="sm" onClick={() => (history.length > 1 ? router.back() : router.push('/'))}>
            <ArrowLeft className="mr-2" /> Back
          </Button>
        </div>
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border">
              {avatar ? (
                <Image src={avatar} alt={user.name} fill sizes="96px" className="object-cover" />
              ) : (
                <Skeleton className="h-full w-full" />)
              }
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                  <RolesBadges user={user} />
                  {joined && (
                    <div className="mt-1 text-xs text-muted-foreground">Joined on {joined}</div>
                  )}
                </div>
                {authorArchive && (
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <a href={authorArchive} target="_blank" rel="noopener noreferrer">
                      View all posts <ExternalLink className="ml-2" />
                    </a>
                  </Button>
                )}
              </div>
              {user.description ? (
                <p className="mt-2 text-muted-foreground leading-relaxed">{user.description}</p>
              ) : (
                <Skeleton className="mt-2 h-5 w-2/3" />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile fields */}
      {user.profile_fields && Object.keys(user.profile_fields).length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(user.profile_fields).map(([key, value]) => (
                  <div key={key} className="rounded-xl border bg-card p-4">
                    <div className="text-xs uppercase text-muted-foreground">{key}</div>
                    <div className="mt-1 font-medium break-words">{String(value)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="mb-8">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldsSkeleton />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs: Posts / Comments (client-side fetch on switch) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue={hasPosts ? 'posts' : 'comments'} className="w-full">
          <TabsList>
            {hasPosts && <TabsTrigger value="posts">Recent Posts</TabsTrigger>}
            <TabsTrigger value="comments">Recent Comments</TabsTrigger>
          </TabsList>
          {hasPosts && (
            <TabsContent value="posts">
              <PostsTabClient slug={user.slug} />
            </TabsContent>
          )}
          <TabsContent value="comments">
            <CommentsTabClient slug={user.slug} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

function RolesBadges({ user }: { user: PublicUserProfile }) {
  const [roles, setRoles] = useState<string[] | null>(() => {
    // Prefer explicit roles field
    if (Array.isArray(user.roles) && user.roles.length) return user.roles
    // Some setups may stash roles in profile_fields.roles
    const pf = user.profile_fields
    if (pf && Array.isArray(pf.roles) && pf.roles.length) return pf.roles as string[]
    // Load cached
    try {
      const cached = localStorage.getItem(`roles:${user.id}`)
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  })

  useEffect(() => {
    if (roles && roles.length) return
    // Best-effort probe: query public users search and find by id (only if it returns roles)
    // Many WP setups do not expose roles publicly; if unavailable, we keep roles hidden.
    const controller = new AbortController()
    const run = async () => {
      try {
        const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
        const res = await fetch(`${site}/api/wp/users?search=${encodeURIComponent(user.slug)}&per_page=20`, {
          signal: controller.signal,
          cache: 'force-cache',
        })
        if (!res.ok) return
        const arr = (await res.json()) as any[]
        const hit = Array.isArray(arr) ? arr.find((u) => u?.id === user.id) : null
        const foundRoles = hit?.roles
        if (Array.isArray(foundRoles) && foundRoles.length) {
          setRoles(foundRoles)
          try { localStorage.setItem(`roles:${user.id}`, JSON.stringify(foundRoles)) } catch {}
        }
      } catch {}
    }
    run()
    return () => controller.abort()
  }, [roles, user.id, user.slug])

  if (!roles || roles.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {roles.map((r) => (
        <span key={r} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {r}
        </span>
      ))}
    </div>
  )
}

function FieldsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border p-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}
