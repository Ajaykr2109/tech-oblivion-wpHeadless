
import React from 'react'
import Head from 'next/head'
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/generateSchema'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getPostBySlug } from '@/lib/wp'
import { getOrBuildToc } from '@/lib/toc'
import TocList from '@/components/toc-list'
import { autoLinkFirst, type AutoLinkTarget } from '@/lib/autolink'
import { sanitizeWP } from '@/lib/sanitize'
import { PostActions } from '@/components/post-actions'
import { RelatedPostsGrid } from '@/components/related-posts-grid'
import { RoleGate } from '@/hooks/useRoleGate'

// This function can remain as-is for now, as it's for SEO and doesn't block rendering.
// In a real app, this would fetch live data.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = params
    const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return { title: post.seo?.title || post.title, description: post.seo?.description }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
    const { slug } = params
    const post = await getPostBySlug(slug)
    if (!post) notFound()
    const p = post!

    const rawHtml = p.contentHtml || ''
    const safeHtml = sanitizeWP(rawHtml)

  // Simple reading time based on words/minute
  const wordsPerMinute = 225
  const wordCount = safeHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  const readingTime = `${readingTimeMinutes} min read`

    // Cached TOC (server memory) – skip entirely if empty
    const tableOfContents = await getOrBuildToc(Number(p.id), safeHtml)

        const highlightedContent = safeHtml.replace(/<pre><code class="language-([a-z0-9_-]+)">([\s\S]*?)<\/code><\/pre>/gi, (match, lang, code) => {
    try {
      const highlighted = hljs.highlight(code, { language: lang }).value
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
    } catch {
      return match
    }
  })

        // Inject IDs into h2/h3 so the TOC anchors work
    const contentWithHeadingIds = highlightedContent.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (m, level, attrs = '', inner) => {
        // If an id already exists, keep it
        if (/\sid=/i.test(attrs)) return m
        const text = inner.replace(/<[^>]+>/g, '').toLowerCase()
        const slug = text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const attrsOut = attrs ? `${attrs} id="${slug}"` : ` id="${slug}"`
        return `<h${level}${attrsOut}>${inner}</h${level}>`
    })

    // Auto-linking: only first occurrence per target; keep minimal list for now
    const autoLinkTargets: AutoLinkTarget[] = [] // populate from settings if available
    const contentLinked = autoLinkFirst(contentWithHeadingIds, autoLinkTargets)

        // Fetch approved comments for this post
        type WPComment = {
            id: number
            post: number
            parent: number
            date: string
            author_name: string
            author_avatar_urls?: Record<string,string>
            content: { rendered: string }
        }
        // Build absolute base URL from request headers (works in server components without Node types)
        const hdrs = headers()
        const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'localhost:3000'
        const proto = hdrs.get('x-forwarded-proto') || 'http'
        const base = `${proto}://${host}`
        const commentsRes = await fetch(`${base}/api/wp/comments?post=${encodeURIComponent(String(p.id))}&status=approve&per_page=50&orderby=date&order=asc`, { cache: 'no-store' })
        const comments: WPComment[] = commentsRes.ok ? await commentsRes.json() : []

        // Build threaded tree
        type CommentNode = WPComment & { children: CommentNode[] }
        const byId = new Map<number, CommentNode>()
        for (const c of comments) byId.set(c.id, { ...c, children: [] })
        const roots: CommentNode[] = []
        for (const c of byId.values()) {
            if (c.parent && byId.has(c.parent)) byId.get(c.parent)!.children.push(c)
            else roots.push(c)
        }

        function RenderComments({ nodes, depth = 0 }: { nodes: CommentNode[]; depth?: number }) {
            return (
                <div className={depth ? 'ml-6 mt-6 space-y-6' : 'space-y-6'}>
                    {nodes.map((c) => (
                        <div key={c.id} className="rounded-md border p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{c.author_name || 'Anonymous'}</span>
                                <span>•</span>
                                <time dateTime={c.date}>{new Date(c.date).toLocaleString()}</time>
                            </div>
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: c.content?.rendered || '' }} />
                            {c.children.length > 0 && <RenderComments nodes={c.children} depth={depth + 1} />}
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <>
                <Head>
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getArticleSchema(p)) }} />
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(p)) }} />
                </Head>
                <div className="container mx-auto px-4 py-10 max-w-7xl">
                            {/* Floating actions */}
                            <div className="fixed right-4 bottom-4 z-40 lg:top-24 lg:bottom-auto">
                                <PostActions postId={Number(p.id)} title={p.title} />
                            </div>
                    {/* Header */}
                    <header className="mb-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight break-words">{p.title}</h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={p.authorAvatar || ''} alt={p.authorName || 'Author'} />
                                            <AvatarFallback>{(p.authorName || 'A').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{p.authorName || 'Unknown'}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <span>•</span>
                                    <span>{readingTime}</span>
                                </div>
                                                                {p.categories && p.categories.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                                                                {p.categories.map(c => (
                                                                                    <span key={c.id}><Badge variant="secondary">{c.name}</Badge></span>
                                                                                ))}
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0">
                                <PostActions postId={Number(p.id)} title={p.title} />
                            </div>
                        </div>
                    </header>

                    {/* Featured banner image 16:9 */}
                    {p.featuredImage && (
                        <div className="mb-10 overflow-hidden rounded-lg shadow">
                            <div className="relative aspect-video w-full">
                        <Image src={p.featuredImage} alt={p.title} fill className="object-cover" priority quality={70} />
                            </div>
                        </div>
                    )}

                    {/* Mobile TOC as accordion */}
                    {tableOfContents.length > 0 && (
                        <div className="lg:hidden mb-6">
                            <Accordion type="single" collapsible>
                                <AccordionItem value="toc">
                                    <AccordionTrigger>On this page</AccordionTrigger>
                                    <AccordionContent>
                                        <TocList items={tableOfContents} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}

                    {/* 3-column layout on desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sticky TOC */}
                        <aside className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-24">
                                {tableOfContents.length > 0 && (
                                    <div className="rounded-lg border bg-card p-4">
                                        <h2 className="text-sm font-semibold mb-3">On this page</h2>
                                        <TocList items={tableOfContents} />
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Article content */}
                        <article className="lg:col-span-6 min-w-0">
                            <div
                                className="prose prose-lg dark:prose-invert max-w-[70ch] w-full leading-7 [&>img]:rounded-lg [&>img]:shadow-md [&>figure>img]:rounded-lg [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>figure>figcaption]:text-sm [&>pre]:rounded-md [&>pre]:p-0 [&_code.hljs]:block"
                                dangerouslySetInnerHTML={{ __html: contentLinked }}
                            />
                        </article>

                        {/* Related posts at side on desktop, move to bottom on mobile */}
                        <aside className="lg:col-span-3">
                            <div className="hidden lg:block">
                                <RelatedPostsGrid />
                            </div>
                        </aside>
                    </div>

                    {/* Related posts for mobile/tablet */}
                    <div className="mt-12 lg:hidden">
                        <RelatedPostsGrid />
                    </div>

                    <Separator className="my-12" />

                    {/* Author box */}
                    <section aria-labelledby="author" className="max-w-4xl">
                        <div className="flex items-start gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={p.authorAvatar || ''} alt={p.authorName || 'Author'} />
                                <AvatarFallback>{(p.authorName || 'A').charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 id="author" className="text-2xl font-bold">{p.authorName || 'Unknown'}</h2>
                                <p className="text-sm text-muted-foreground">Author</p>
                                <p className="mt-2 text-muted-foreground">{p.seo?.description || '—'}</p>
                                <div className="mt-3 flex items-center gap-4">
                                    {/* Socials from profile_fields if available could be linked here */}
                                    <Link href={"/profile/" + encodeURIComponent(p.authorName || 'user')} className="text-sm underline">View profile</Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator className="my-12" />

                    {/* Comments */}
                    <section aria-labelledby="comments" className="max-w-4xl">
                        <Card>
                            <CardHeader>
                                <CardTitle id="comments">Comments{comments.length ? ` (${comments.length})` : ''}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* If not logged in, show login prompt */}
                                <RoleGate action="comment" as="div" disabledClassName="">
                                    <form className="grid gap-4">
                                        <Textarea placeholder="Write a comment..." rows={4} />
                                        <div className="flex justify-end"><Button>Post Comment</Button></div>
                                    </form>
                                </RoleGate>
                                {/* When gated, provide message and link */}
                                <RoleGate action="comment" as="div" className="hidden" disabledClassName="block">
                                    <div className="text-sm text-muted-foreground">
                                        <Link href="/login" className="underline">Log in</Link> to comment.
                                    </div>
                                </RoleGate>

                                                                {/* Threaded comments list */}
                                                                <div className="mt-6">
                                                                    {roots.length === 0 ? (
                                                                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                                                                    ) : (
                                                                        <RenderComments nodes={roots} />
                                                                    )}
                                                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </>
        )
}
