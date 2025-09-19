import { Twitter, Linkedin, Github, Edit3 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeEntities } from "@/lib/text";
import { getSessionUser } from "@/lib/auth";
import { getUserBySlug } from "@/lib/wp-public";

export default async function PublicProfilePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params
  const viewingUser = await getSessionUser().catch(() => null)
  const user = await getUserBySlug(username)
  if (!user) notFound()
  const isSelf = !!(viewingUser && String((viewingUser as { wpUserId?: unknown; id?: unknown }).wpUserId ?? (viewingUser as { wpUserId?: unknown; id?: unknown }).id) === String(user.id))

  // Map WP user fields to UI
  const nameRaw = user.name || username
  const name = decodeEntities(String(nameRaw))
  const avatar = user.avatar_urls?.['96'] || user.avatar_urls?.['48'] || user.avatar_urls?.['24'] || `https://i.pravatar.cc/150?u=${username}`
  // Bio comes from WP 'description' field in the FE plugin payload
  const bio = decodeEntities(String(user.description || ""))
  const pf = (user.profile_fields && typeof user.profile_fields === 'object') ? (user.profile_fields as Record<string, unknown>) : null
  function getPFString(key: string): string | undefined {
    if (!pf) return undefined
    const v = pf[key]
    if (typeof v === 'string') return v
    return undefined
  }
  function getPFArray(key: string): string[] | undefined {
    if (!pf) return undefined
    const v = pf[key]
    if (Array.isArray(v)) return v.map(String)
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return undefined
  }
  function ensureUrl(u?: string) {
    if (!u) return undefined
    const s = u.trim()
    if (!s) return undefined
    if (/^https?:\/\//i.test(s)) return s
    return `https://${s}`
  }
  const social = {
    twitter: ensureUrl(getPFString('twitter') || getPFString('x') || getPFString('twitter_url')),
    linkedin: ensureUrl(getPFString('linkedin') || getPFString('linkedin_url')),
    github: ensureUrl(getPFString('github') || getPFString('github_url')),
  }
  const rolesList = getPFArray('roles') || getPFArray('role') || getPFArray('roles_display')

  // Determine if we should show authored posts. Hide for plain subscribers/readers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userHasRecentPosts = Array.isArray((user as any)?.recent_posts) && (user as any).recent_posts.length > 0
  const showArticlesTab = userHasRecentPosts
  const showCommentsTab = true // Always allow comments tab (even if empty) unless both empty and we show a unified empty state
  const defaultTab = showArticlesTab ? 'articles' : 'comments'

  // Server-side fetch of posts and comments authored by this user
  type WPPost = { id: number; slug: string; title?: { rendered?: string }; excerpt?: { rendered?: string }; date?: string }
  type WPComment = { id: number; post: number; content?: { rendered?: string }; date?: string }
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const postsJson: WPPost[] = showArticlesTab ? await (async () => {
    const postsRes = await fetch(new URL(`/api/wp/posts?author=${encodeURIComponent(String(user.id))}&per_page=9`, SITE).toString(), { cache: 'no-store' })
    return postsRes.ok ? await postsRes.json() : []
  })() : []
  const commentsRes = await fetch(new URL(`/api/wp/comments?author=${encodeURIComponent(String(user.id))}&status=approve&per_page=20&orderby=date&order=desc`, SITE).toString(), { cache: 'no-store' })
  const commentsJson: WPComment[] = commentsRes.ok ? await commentsRes.json() : []

  const stripTags = (html?: string) => decodeEntities(String(html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim())

  // Defensive filter: Some upstream responses (especially with caching/proxy layers) may ignore the author filter.
  // Re-filter locally if any post author metadata sneaks in via recent_posts or if structure includes author field.
  // (postsJson from /api/wp/posts currently returns raw WP posts; they SHOULD be author-filtered server-side.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface PossiblyAuthoredPost { id: number; slug: string; title?: { rendered?: string }; excerpt?: { rendered?: string }; date?: string; author?: unknown }
  const posts = (postsJson as PossiblyAuthoredPost[])
    // If API mistakenly returned other authors, drop them (when author field is present)
    .filter(p => p.author == null || String(p.author) === String(user.id))
    .map(p => ({
      id: p.id,
      slug: p.slug,
      title: decodeEntities(String(p.title?.rendered || 'Untitled')),
      excerpt: stripTags(p.excerpt?.rendered),
      date: p.date,
    }))

  // Resolve comment post titles/slugs in one fetch
  const postIds = Array.from(new Set(commentsJson.map(c => c.post).filter(Boolean)))
  const postMap = new Map<number, { slug: string; title: string }>()
  if (postIds.length) {
    const include = postIds.join(',')
    const incRes = await fetch(new URL(`/api/wp/posts?include=${include}&per_page=${Math.min(100, postIds.length)}`, SITE).toString(), { cache: 'no-store' })
    if (incRes.ok) {
      const arr: WPPost[] = await incRes.json()
      for (const p of arr) {
        postMap.set(p.id, { slug: p.slug, title: decodeEntities(String(p.title?.rendered || 'Untitled')) })
      }
    }
  }
  // Defensive filter for comments: ensure each comment includes implicit author by virtue of having come from author filter.
  // If upstream returns broader set, re-filter where possible (some payloads include an 'author' field).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface PossiblyAuthoredComment { id: number; post: number; content?: { rendered?: string }; date?: string; author?: unknown }
  const comments = (commentsJson as PossiblyAuthoredComment[])
    .filter(c => c.author == null || String(c.author) === String(user.id))
    .map(c => ({
      id: c.id,
      postSlug: postMap.get(c.post)?.slug || String(c.post),
      postTitle: postMap.get(c.post)?.title || 'View post',
      content: stripTags(c.content?.rendered),
      date: c.date,
    }))

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Profile header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center gap-6 md:flex-row md:text-left">
            <Avatar className="h-28 w-28">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{name}</h1>
              {rolesList && rolesList.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">{rolesList.join(', ')}</p>
              )}
              <p className="text-muted-foreground">@{username}</p>
              <p className="mt-3 text-muted-foreground max-w-2xl">{bio || '—'}</p>
              <div className="mt-4 flex items-center gap-6 flex-wrap">
                {isSelf && (
                  <Button asChild>
                    <Link href="/account"><Edit3 className="mr-2 h-4 w-4" /> Edit profile</Link>
                  </Button>
                )}
                <div className="flex gap-4">
                  {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Twitter"><Twitter /></a>}
                  {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="LinkedIn"><Linkedin /></a>}
                  {social.github && <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="GitHub"><Github /></a>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs / Conditional layout */}
      {posts.length === 0 && comments.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          This user hasn’t published any articles or comments yet.
        </div>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            {showArticlesTab && <TabsTrigger value="articles">Articles</TabsTrigger>}
            {showCommentsTab && <TabsTrigger value="comments">Comments</TabsTrigger>}
          </TabsList>

          {showArticlesTab && (
            <TabsContent value="articles" className="mt-6">
              {posts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">No articles yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map(p => (
                    <Card key={p.id} className="transition hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-lg">{p.title}</CardTitle>
                        {p.date && <CardDescription>{new Date(p.date).toLocaleDateString()}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        {p.excerpt ? (
                          <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No summary available.</p>
                        )}
                        <div className="mt-4">
                          <Link className="text-primary hover:underline" href={`/blog/${p.slug}`}>Read more →</Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {showCommentsTab && (
            <TabsContent value="comments" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto divide-y">
                    {comments.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No comments yet.</div>
                    ) : comments.map(c => (
                      <div key={c.id} className="p-6">
                        <p className="text-sm">{c.content}</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          On <Link href={`/blog/${c.postSlug}`} className="underline">{c.postTitle}</Link>
                          {c.date ? <> • {new Date(c.date).toLocaleDateString()}</> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Removed legacy About tab block – can be reintroduced if needed */}
    </div>
  )
}