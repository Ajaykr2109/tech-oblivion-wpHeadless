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
import { Twitter, Linkedin, Github, Clock, Eye } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getPostBySlug, type PostDetail } from '@/lib/wp'
import { getOrBuildToc } from '@/lib/toc'
import TableOfContents from '@/components/toc/TableOfContents'
import type { TocItem as HtmlTocItem } from '@/lib/toc'
import { autoLinkFirst, type AutoLinkTarget } from '@/lib/autolink'
import { sanitizeWP } from '@/lib/sanitize'
import PostActions from '@/components/post-actions'
import CommentsSection from '@/components/comments-section'
import ReadingProgress from '@/components/reading-progress'
import FloatingActions from '@/components/floating-actions'
import ContentDecorators from '@/components/content-decorators'
import { Suspense } from 'react'
import ReaderToolbar from '@/components/reader-toolbar'
import ReaderToolbarPortal from '@/components/reader-toolbar-portal'
import BackToTopCenter from '@/components/back-to-top-center'
import { getLatestByAuthor } from '@/lib/wp-author'
import ViewsCounter from '@/components/views-counter'
import ErrorBoundary from '@/components/error-boundary'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer'
import { extractTocFromMarkdown } from '@/lib/toc-md'
import { decodeEntities } from '@/lib/entities'

// ToolbarPortal moved to component file

// Enhanced recommendation type with more metadata
type EnhancedRecommendation = {
  id: number
  slug: string
  title: string
  excerpt?: string
  featuredImage?: string
  authorName?: string
  date?: string
  readingTime?: string
}

type PageParams = { params: { slug: string } }
type PageProps = { params: { slug: string }, searchParams?: Record<string, string | string[] | undefined> }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = params
    const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return { title: post.seo?.title || post.title, description: post.seo?.description }
}

export default async function PostPage({ params, searchParams }: PageProps) {
    const { slug } = params
        let post: PostDetail | null = null
        try {
            post = await getPostBySlug(slug)
        } catch (e) {
            console.error('Failed to load post', e)
            post = null
        }
        if (!post) notFound()

    const rawHtml = post.contentHtml || ''
    const safeHtml = sanitizeWP(rawHtml)

    // Simple reading time based on words/minute
  const wordsPerMinute = 225
  const wordCount = safeHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  const readingTime = `${readingTimeMinutes} min read`

    // 🔧 FIX: Process content in correct order BEFORE TOC generation
    const highlightedContent = safeHtml.replace(/<pre><code class="language-([a-z0-9_-]+)">([\s\S]*?)<\/code><\/pre>/gi, (match, lang, code) => {
        try {
            const highlighted = hljs.highlight(code, { language: lang }).value
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
        } catch {
            return match
        }
    })

    // 🔧 FIX: Inject heading IDs BEFORE TOC generation
    const contentWithHeadingIds = highlightedContent.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (m, level, attrs = '', inner) => {
        if (/\sid=/i.test(attrs)) return m
        const text = decodeEntities(inner.replace(/<[^>]+>/g, '')).toLowerCase()
        const slug = text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const attrsOut = attrs ? `${attrs} id="${slug}"` : ` id="${slug}"`
        return `<h${level}${attrsOut}>${inner}</h${level}>`
    })

        // Generate TOC (legacy for anchors), and markdown items for new TOC component
        let tableOfContents: HtmlTocItem[] = []
        const mdItems = (post as any).content_raw ? extractTocFromMarkdown((post as any).content_raw as string, { minDepth: 1, maxDepth: 6 }) : []
        if ((post as any).content_raw) {
            const mdToc = mdItems
            tableOfContents = mdToc
                .filter(i => i.depth === 2 || i.depth === 3)
                .map(i => ({ level: (i.depth as 2 | 3), text: decodeEntities(i.value), slug: i.id }))
        } else {
            tableOfContents = await getOrBuildToc(Number(post.id), contentWithHeadingIds)
        }

    // Auto-linking: only first occurrence per target
    const autoLinkTargets: AutoLinkTarget[] = []
    const contentLinked = autoLinkFirst(contentWithHeadingIds, autoLinkTargets)

    // 🚀 ENHANCED: Better recommendations with more metadata
    let recommended: EnhancedRecommendation[] = []
    // Try to infer author id from categories/tags data model; fallback 0 (no fetch)
    const authorId = (post as any).author ?? 0
    const latestByAuthor = authorId ? await getLatestByAuthor(Number(authorId), Number(post.id), 3) : []
    try {
        const cats = (post.categories || []).map(c => c.id).join(',')
        const tags = (post.tags || []).map(t => t.id).join(',')
        const qs = new URLSearchParams()
        if (cats) qs.set('categories', cats)
        if (tags) qs.set('tags', tags)
        qs.set('exclude', String(post.id))
        qs.set('per_page', '4') // Get one extra for better selection
        const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
        const url = `${origin || ''}/api/wp/related?${qs.toString()}`
        const r = await fetch(url, { 
            headers: { Accept: 'application/json' }, 
            cache: 'no-store',
            next: { revalidate: 300 } // Cache for 5 minutes
        })
        if (r.ok) {
            const data = (await r.json()) as any[]
            recommended = (data || []).slice(0, 3).map(d => {
                // Calculate reading time for each recommendation
                const content = d.content?.rendered || d.excerpt?.rendered || ''
                const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
                const recReadingTime = Math.max(1, Math.ceil(words / wordsPerMinute))
                
                return {
                    id: d.id,
                    slug: d.slug,
                    title: d.title?.rendered || '',
                    excerpt: d.excerpt?.rendered?.replace(/<[^>]+>/g, '').substring(0, 120) + '...' || '',
                    featuredImage: d.featured_media_url || d.jetpack_featured_media_url || '',
                    authorName: d.author_info?.display_name || '',
                    date: d.date || '',
                    readingTime: `${recReadingTime} min read`
                }
            })
        }
    } catch (error) {
        console.warn('Failed to fetch recommendations:', error)
        // Fallback recommendations could be hardcoded popular posts
    }

    // Popular posts by views (cached)
    let popular: EnhancedRecommendation[] = []
    try {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
        const url = `${origin || ''}/api/wp/popular?limit=6`
        const r = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 600 } })
        if (r.ok) {
            const data = (await r.json()) as any[]
            popular = (data || []).map(d => ({
                id: d.id,
                slug: d.slug,
                title: d.title?.rendered || d.title || '',
                excerpt: (d.excerpt || '').substring(0, 120) + (d.excerpt && d.excerpt.length > 120 ? '...' : ''),
                featuredImage: d.featuredImage || d.featured_media_url || d.jetpack_featured_media_url || '',
                authorName: d.authorName || '',
                date: d.date || '',
            }))
        }
    } catch (e) {
        console.warn('Failed to fetch popular posts:', e)
    }

    // Recent posts (chronological)
    let recent: EnhancedRecommendation[] = []
    try {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
        const url = `${origin || ''}/api/wp/posts?per_page=6&_embed=1`
        const r = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 120 } })
        if (r.ok) {
            const data = (await r.json()) as any[]
            recent = (data || []).map((p) => ({
                id: p.id,
                slug: p.slug,
                title: p.title?.rendered || '',
                excerpt: (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').substring(0, 120) + '...',
                featuredImage: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || p.featured_media_url || p.jetpack_featured_media_url || '',
                authorName: p._embedded?.author?.[0]?.name || '',
                date: p.date || '',
            }))
        }
    } catch (e) {
        console.warn('Failed to fetch recent posts:', e)
    }

    const floatImage = typeof searchParams?.floatImage === 'string' 
        ? ['1','true','yes','on'].includes(String(searchParams?.floatImage).toLowerCase())
        : false

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
            {/* Top-center reader pill (Zoom + theme), positioned respecting header */}
            <ReaderToolbarPortal />
            {/* Center back-to-top pill */}
            <BackToTopCenter />

            {/* 🚀 NEW: Reading Progress Bar */}
            <ReadingProgress />

            <div className="container mx-auto px-4 py-10 max-w-[90rem] 2xl:max-w-[96rem]">
                {/* 🚀 ENHANCED: Breadcrumb Navigation */}
                <nav className="mb-4 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">Home</Link>
                    <span className="mx-1">›</span>
                    <Link href="/blog" className="hover:text-foreground">Blog</Link>
                    {post.categories?.[0] && (
                        <>
                            <span className="mx-1">›</span>
                            <Link href={`/categories/${post.categories[0].slug}`} className="hover:text-foreground">
                                {post.categories[0].name}
                            </Link>
                        </>
                    )}
                    <span className="mx-1">›</span>
                    <span className="text-foreground">{post.title}</span>
                </nav>

                {/* Header */}
                <header className="relative mb-6">
                    {/* Actions pinned on desktop */}
                    <div className="hidden lg:block absolute right-0 top-0">
                        <PostActions postId={Number(post.id)} slug={post.slug} title={post.title} />
                    </div>
                    <div className="max-w-3xl mx-auto text-center">
                       <h1 className="max-w-4xl mx-auto text-3xl md:text-5xl font-bold tracking-tight mb-6 break-words leading-tight text-center">
                        {post.title}
                       </h1>

                        <div className="flex flex-wrap items-center justify-center gap-3 text-muted-foreground text-sm">
                            {/* Categories as badges */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {(post.categories && post.categories.length > 0) ? (
                                    post.categories.map(c => (
                                        <Badge key={c.id} variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                            <Link href={`/categories/${c.slug}`}>{c.name}</Link>
                                        </Badge>
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
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {readingTime}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="inline-flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <ViewsCounter postId={Number(post.id)} />
                            </span>
                        </div>
                        {/* Actions inline on mobile */}
                        <div className="mt-3 lg:hidden flex justify-center">
                            <PostActions postId={Number(post.id)} slug={post.slug} title={post.title} />
                        </div>
                    </div>
                </header>

                <FloatingActions title={post.title} postId={Number(post.id)} />
                

        {/* Featured banner */}
    {post.featuredImage ? (
        <div className={`mb-10 lg:w-1/2 mx-auto ${floatImage ? 'lg:hidden' : ''}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
                            <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                                priority={false}
                                quality={70}
                            />
                        </div>
                    </div>
                ) : null}

                                {/* Mobile/Tablet TOC (use markdown items or HTML fallback) */}
                                {(() => {
                                        const itemsForTOC = (mdItems && mdItems.length > 0)
                                                ? mdItems
                                                : (tableOfContents || []).map(i => ({ id: i.slug, value: i.text, depth: i.level }))
                                        return itemsForTOC.length > 0 ? (
                                                                    <div className="lg:hidden mb-6">
                                                                        <TableOfContents items={itemsForTOC as unknown as any[]} />
                                                                    </div>
                                        ) : null
                                })()}

                                <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-8">
                    {/* 🔧 FIX: Sticky TOC with better positioning */}
                                                            <aside className="self-start hidden lg:block print:hidden" style={{ position: 'sticky', top: 'calc(var(--header-height) + 16px)' }}>
                        {(() => {
                            const itemsForTOC = (mdItems && mdItems.length > 0)
                                ? mdItems
                                : (tableOfContents || []).map(i => ({ id: i.slug, value: i.text, depth: i.level }))
                            return itemsForTOC.length > 0 ? (
                            <div className="lg:sticky top-20"> {/* Reduced from top-24 to top-20 */}
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    On this page
                                </h2>
                                <TableOfContents items={itemsForTOC as unknown as any[]} />
                            </div>
                            ) : null
                        })()}
                    </aside>

                                        <article className="min-w-0">
                        {/* Meta info bar removed to avoid duplication */}

                                                                                                {/* Optional float image on desktop */}
                                                                                                {floatImage && post.featuredImage ? (
                                                                                                    <figure className="hidden lg:block float-left mr-6 mb-4 w-[320px] xl:w-[360px]">
                                                                                                        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg shadow-md">
                                                                                                            <Image src={post.featuredImage} alt={post.title} fill sizes="360px" className="object-cover" />
                                                                                                        </div>
                                                                                                    </figure>
                                                                                                ) : null}

                        { (post as any).content_raw ? (
                                                    <MarkdownRenderer
                            markdown={decodeEntities((post as any).content_raw as string)}
                                                                                                                className="wp-content prose prose-lg dark:prose-invert max-w-[70ch] w-full min-w-0 mx-auto leading-7 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:scroll-mt-24 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:scroll-mt-24 [&>p]:mb-3 [&>figure]:my-5 [&>figure>img]:rounded-lg [&>figure>img]:shadow-md [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-3 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg [&>pre]:relative [&>pre]:group"
                                                    />
                                                ) : (
                                                    <div
                                                                                                                className="wp-content prose prose-lg dark:prose-invert max-w-[70ch] w-full min-w-0 mx-auto leading-7 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:scroll-mt-24 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:scroll-mt-24 [&>p]:mb-3 [&>figure]:my-5 [&>figure>img]:rounded-lg [&>figure>img]:shadow-md [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-3 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg [&>pre]:relative [&>pre]:group"
                                                        dangerouslySetInnerHTML={{ __html: decodeEntities(contentLinked) }}
                                                    />
                                                )}
                        {/* Client decorators for anchors, code copy, quote share */}
                        <ContentDecorators selector=".wp-content" />

                        {/* Tags hidden on post view */}
                    </article>

                                        {/* Enhanced Right sidebar: Related, Recommended, Popular, Recent, Author latest */}
                                        <aside className="self-start">
                                                <div className="bg-card p-6 rounded-lg shadow-lg">
                                                        <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Failed to load related posts.</div>}>
                                                                <RelatedPostsSidebar
                                                                                currentPostId={Number(post.id)}
                                                                                currentPostCategories={post.categories?.map(c => ({ id: c.id, name: c.name || '', slug: c.slug || '' }))}
                                                                                currentPostTags={post.tags?.map(t => ({ id: t.id, name: t.name || '', slug: t.slug || '' }))}
                                                                />
                                                        </ErrorBoundary>
                                                </div>

                                                {/* Recommended Posts */}
                                                {recommended.length > 0 && (
                                                    <div className="mt-6 bg-card p-6 rounded-lg shadow-lg">
                                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recommended Posts</h3>
                                                        <ul className="space-y-4">
                                                            {recommended.map(r => (
                                                                <li key={r.id}>
                                                                    <Link href={`/blog/${r.slug}`} className="group flex gap-3">
                                                                        {r.featuredImage ? (
                                                                            <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                                                                                <Image src={r.featuredImage} alt={r.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                                                            </div>
                                                                        ) : null}
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-medium group-hover:text-primary line-clamp-2">{r.title}</div>
                                                                            {r.excerpt ? <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.excerpt}</div> : null}
                                                                        </div>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Popular Posts */}
                                                {popular.length > 0 && (
                                                    <div className="mt-6 bg-card p-6 rounded-lg shadow-lg">
                                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Popular Posts</h3>
                                                        <ul className="space-y-4">
                                                            {popular.map(p => (
                                                                <li key={p.id}>
                                                                    <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                                                                        {p.featuredImage ? (
                                                                            <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                                                                                <Image src={p.featuredImage} alt={p.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                                                            </div>
                                                                        ) : null}
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-medium group-hover:text-primary line-clamp-2">{p.title}</div>
                                                                            {p.excerpt ? <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.excerpt}</div> : null}
                                                                        </div>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Recent Posts */}
                                                {recent.length > 0 && (
                                                    <div className="mt-6 bg-card p-6 rounded-lg shadow-lg">
                                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Posts</h3>
                                                        <ul className="space-y-4">
                                                            {recent.map(p => (
                                                                <li key={p.id}>
                                                                    <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                                                                        {p.featuredImage ? (
                                                                            <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                                                                                <Image src={p.featuredImage} alt={p.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                                                            </div>
                                                                        ) : null}
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-medium group-hover:text-primary line-clamp-2">{p.title}</div>
                                                                            {p.excerpt ? <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.excerpt}</div> : null}
                                                                        </div>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Author's latest posts */}
                                                {Array.isArray(latestByAuthor) && latestByAuthor.length > 0 && (
                                                        <div className="mt-6 bg-card p-6 rounded-lg shadow-lg">
                                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">More from the author</h3>
                                                                <ul className="space-y-3">
                                                                        {latestByAuthor.map((p: any) => (
                                                                                <li key={p.id}>
                                                                                        <Link href={`/blog/${p.slug}`} className="text-sm hover:underline line-clamp-2">{p.title?.rendered || p.title}</Link>
                                                                                </li>
                                                                        ))}
                                                                </ul>
                                                        </div>
                                                )}
                                        </aside>
                </div>

                <Separator className="my-12" />

                {/* 🚀 ENHANCED: Author box with more details */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-card/50 p-6 rounded-lg border flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                            <AvatarImage src={post.authorAvatar || ''} alt={post.authorName || 'Author'} />
                            <AvatarFallback className="text-2xl font-bold">{(post.authorName || 'A').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-1">WRITTEN BY</h3>
                            <h2 className="text-2xl font-bold mb-2">{post.authorName || 'Unknown'}</h2>
                            <p className="text-muted-foreground mb-4">
                                An avid writer and technologist sharing insights on modern development practices. 
                                {/* This could be pulled from author bio field */}
                            </p>
                            <div className="flex items-center gap-4 mb-4">
                                <a href={post.seo?.twitterImage ? post.seo?.canonical || '#' : '#'} aria-label="Twitter" className="text-muted-foreground hover:text-blue-500 transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href={post.seo?.canonical || '#'} aria-label="LinkedIn" className="text-muted-foreground hover:text-blue-600 transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a href={post.authorName ? `https://github.com/${encodeURIComponent(post.authorName.replace(/\s+/g,'').toLowerCase())}` : '#'} aria-label="GitHub" className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <Github className="h-5 w-5" />
                                </a>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="text-sm text-primary hover:underline font-medium">
                                    View full profile →
                                </Link>
                                <button className="text-sm bg-primary text-primary-foreground px-4 py-1 rounded-full hover:bg-primary/90 transition-colors">
                                    + Follow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-12" />

                {/* Comments section */
                }
                <div className="max-w-4xl mx-auto">
                                        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading comments...</div>}> 
                                            <CommentsSection postId={Number(post.id)} />
                                        </Suspense>
                </div>

                {/* Bottom explore sections moved to right sidebar per layout spec */}
            </div>

        </>
    );
}