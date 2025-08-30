
import React from 'react'
import Head from 'next/head'
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/generateSchema'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { notFound } from 'next/navigation'
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar'
import { Twitter, Linkedin, Github } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getPostBySlug } from '@/lib/wp'
import { getOrBuildToc } from '@/lib/toc'
import TocList from '@/components/toc-list'
import { autoLinkFirst, type AutoLinkTarget } from '@/lib/autolink'
import { sanitizeWP } from '@/lib/sanitize'
import PostActions from '@/components/post-actions'
import CommentsSection from '@/components/comments-section'

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

    const rawHtml = post.contentHtml || ''
    const safeHtml = sanitizeWP(rawHtml)

  // Simple reading time based on words/minute
  const wordsPerMinute = 225
  const wordCount = safeHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  const readingTime = `${readingTimeMinutes} min read`

        // Cached TOC (server memory) – skip entirely if empty
        const tableOfContents = await getOrBuildToc(Number(post.id), safeHtml)

        // Fetch related recommendations for bottom grid (best-effort)
        let recommended: Array<{ id: number; slug: string; title: string }> = []
        try {
            const cats = (post.categories || []).map(c => c.id).join(',')
            const tags = (post.tags || []).map(t => t.id).join(',')
            const qs = new URLSearchParams()
            if (cats) qs.set('categories', cats)
            if (tags) qs.set('tags', tags)
            qs.set('exclude', String(post.id))
            qs.set('per_page', '3')
            const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
            const url = `${origin || ''}/api/wp/related?${qs.toString()}`
            const r = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
            if (r.ok) {
                const data = (await r.json()) as any[]
                recommended = (data || []).map(d => ({ id: d.id, slug: d.slug, title: d.title?.rendered || '' }))
            }
        } catch {}

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

    return (
        <>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(getArticleSchema(post)) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(post)) }}
                />
            </Head>
            <div className="container mx-auto px-4 py-10 max-w-7xl">
                {/* Header */}
                <header className="relative mb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 break-words">{post.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
                                {/* Categories as badges */}
                                <div className="flex flex-wrap gap-2">
                                    {(post.categories && post.categories.length > 0) ? (
                                        post.categories.map(c => (
                                            <Badge key={c.id} variant="secondary">{c.name}</Badge>
                                        ))
                                    ) : null}
                                </div>
                                {post.categories?.length ? <span className="hidden sm:inline">•</span> : null}
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={post.authorAvatar || ''} alt={post.authorName || 'Author'} />
                                        <AvatarFallback>{(post.authorName || 'A').charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{post.authorName || 'Unknown'}</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="inline-flex items-center gap-1">{readingTime}</span>
                            </div>
                        </div>
                        {/* Floating actions */}
                        <PostActions postId={Number(post.id)} slug={post.slug} title={post.title} />
                    </div>
                </header>
            

                {/* Featured banner */}
                {post.featuredImage ? (
                    <div className="mb-10">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
                            <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 1024px"
                                className="object-cover"
                                priority={false}
                                quality={70}
                            />
                        </div>
                    </div>
                ) : null}

                {/* Mobile TOC (accordion) */}
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sticky TOC on desktop (left) */}
                        <aside className="lg:col-span-2 self-start hidden lg:block">
                            {tableOfContents.length > 0 && (
                                <div className="lg:sticky top-24">
                                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">On this page</h2>
                                    <div className="rounded-md border bg-card p-4">
                                        <TocList items={tableOfContents} />
                                    </div>
                                </div>
                            )}
                        </aside>

                <article className="lg:col-span-8 min-w-0">
                    <div
                        className="wp-content prose prose-lg dark:prose-invert max-w-[70ch] w-full min-w-0 mx-auto leading-7 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-4 [&>figure]:my-6 [&>figure>img]:rounded-lg [&>figure>img]:shadow-md [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg"
                        dangerouslySetInnerHTML={{ __html: contentLinked }}
                    />
                </article>

                        {/* Related sidebar on desktop (right) */}
                        <aside className="lg:col-span-2 self-start">
                            <div className="bg-card p-6 rounded-lg shadow-lg">
                                <RelatedPostsSidebar
                                    currentPostId={Number(post.id)}
                                    currentPostCategories={post.categories?.map(c => ({ id: c.id, name: c.name || '', slug: c.slug || '' }))}
                                    currentPostTags={post.tags?.map(t => ({ id: t.id, name: t.name || '', slug: t.slug || '' }))}
                                />
                            </div>
                        </aside>
        </div>

        <Separator className="my-12" />

                {/* Author box */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-card/50 p-6 rounded-lg flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={post.authorAvatar || ''} alt={post.authorName || 'Author'} />
                            <AvatarFallback>{(post.authorName || 'A').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">Written by</h3>
                            <h2 className="text-2xl font-bold">{post.authorName || 'Unknown'}</h2>
                            <p className="text-sm text-muted-foreground mb-4">{post.authorName ? `${post.authorName} · Author` : 'Author'}</p>
                            <p className="text-muted-foreground mb-4">An avid writer and technologist. Short bio can go here if available.</p>
                            <div className="flex gap-4">
                                <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
                                <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
                                <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>
                            </div>
                            <div className="mt-4">
                                <Link href="/profile" className="text-sm text-primary hover:underline">View full profile</Link>
                            </div>
                        </div>
                    </div>
                </div>

    <Separator className="my-12" />
                {/* Comments section */}
                <div className="max-w-4xl mx-auto">
                    <CommentsSection postId={Number(post.id)} />
                </div>

                {/* Recommended posts grid */}
                {recommended.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {recommended.map(r => (
                                <Link key={r.id} href={`/blog/${r.slug}`} className="group">
                                    <div className="h-full rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                        <h3 className="font-semibold group-hover:underline line-clamp-2">{r.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">Keep reading related insights.</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
