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
import TocList from '@/components/toc-list'
import { autoLinkFirst, type AutoLinkTarget } from '@/lib/autolink'
import { sanitizeWP } from '@/lib/sanitize'
import PostActions from '@/components/post-actions'
import CommentsSection from '@/components/comments-section'
import ReadingProgress from '@/components/reading-progress'
import FloatingActions from '@/components/floating-actions'
import ContentDecorators from '@/components/content-decorators'
import { Suspense } from 'react'
import ReaderToolbar from '@/components/reader-toolbar'
import { getLatestByAuthor } from '@/lib/wp-author'
import BackToTop from '@/components/back-to-top'
import ViewsCounter from '@/components/views-counter'
import ErrorBoundary from '@/components/error-boundary'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer'

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
type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = params
    const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return { title: post.seo?.title || post.title, description: post.seo?.description }
}

export default async function PostPage({ params }: PageProps) {
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
        const text = inner.replace(/<[^>]+>/g, '').toLowerCase()
        const slug = text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const attrsOut = attrs ? `${attrs} id="${slug}"` : ` id="${slug}"`
        return `<h${level}${attrsOut}>${inner}</h${level}>`
    })

    // 🔧 FIX: Generate TOC from content that already has heading IDs
    const tableOfContents = await getOrBuildToc(Number(post.id), contentWithHeadingIds)

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
            <ReaderToolbar />

            {/* 🚀 NEW: Reading Progress Bar */}
            <ReadingProgress />

            <div className="container mx-auto px-4 py-10 max-w-7xl">
                {/* 🚀 ENHANCED: Breadcrumb Navigation */}
                <nav className="mb-6 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/blog" className="hover:text-foreground">Blog</Link>
                    {post.categories?.[0] && (
                        <>
                            <span className="mx-2">›</span>
                            <Link href={`/category/${post.categories[0].slug}`} className="hover:text-foreground">
                                {post.categories[0].name}
                            </Link>
                        </>
                    )}
                    <span className="mx-2">›</span>
                    <span className="text-foreground">{post.title}</span>
                </nav>

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
                                            <Badge key={c.id} variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                                <Link href={`/category/${c.slug}`}>{c.name}</Link>
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
                                {/* 🚀 NEW: View count placeholder */}
                                <span className="hidden sm:inline">•</span>
                                <span className="inline-flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <ViewsCounter postId={Number(post.id)} />
                                </span>
                            </div>
                        </div>
                        {/* Floating actions */}
                        <PostActions postId={Number(post.id)} slug={post.slug} title={post.title} />
                    </div>
                </header>

                <FloatingActions title={post.title} postId={Number(post.id)} />
                <BackToTop />

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

                {/* 🔧 FIX: Mobile TOC with better conditional rendering */}
                {tableOfContents && tableOfContents.length > 0 && (
                    <div className="lg:hidden mb-6">
                        <Accordion type="single" collapsible>
                            <AccordionItem value="toc">
                                <AccordionTrigger className="text-base font-medium">
                                    📋 On this page ({tableOfContents.length} sections)
                                </AccordionTrigger>
                                <AccordionContent>
                                    <TocList items={tableOfContents} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 🔧 FIX: Sticky TOC with better positioning */}
                    <aside className="lg:col-span-2 self-start hidden lg:block">
                        {tableOfContents && tableOfContents.length > 0 && (
                            <div className="lg:sticky top-20"> {/* Reduced from top-24 to top-20 */}
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    On this page
                                </h2>
                                <div className="rounded-md border bg-card p-4 shadow-sm">
                                    <TocList items={tableOfContents} />
                                </div>
                                
                                {/* 🚀 NEW: Quick stats in TOC sidebar */}
                                <div className="mt-4 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{readingTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-3 w-3" />
                                        <ViewsCounter postId={Number(post.id)} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>

                    <article className="lg:col-span-8 min-w-0">
                        {/* 🚀 NEW: Article meta info bar */}
                        <div className="mb-6 p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-medium">📊 Article Info:</span>
                                <span>{wordCount} words</span>
                                <span>•</span>
                                <span>{readingTime}</span>
                                <span>•</span>
                                {/* <span>Updated {new Date(post.modified || post.date).toLocaleDateString()}</span> */}
                            </div>
                        </div>

                                                { (post as any).content_raw ? (
                                                    <MarkdownRenderer
                                                        markdown={(post as any).content_raw as string}
                                                        className="wp-content prose prose-lg dark:prose-invert max-w-[70ch] w-full min-w-0 mx-auto leading-7 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:scroll-mt-24 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:scroll-mt-24 [&>p]:mb-4 [&>figure]:my-6 [&>figure>img]:rounded-lg [&>figure>img]:shadow-md [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg [&>pre]:relative [&>pre]:group"
                                                    />
                                                ) : (
                                                    <div
                                                        className="wp-content prose prose-lg dark:prose-invert max-w-[70ch] w-full min-w-0 mx-auto leading-7 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:scroll-mt-24 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:scroll-mt-24 [&>p]:mb-4 [&>figure]:my-6 [&>figure>img]:rounded-lg [&>figure>img]:shadow-md [&>figure>figcaption]:mt-2 [&>figure>figcaption]:text-center [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg [&>pre]:relative [&>pre]:group"
                                                        dangerouslySetInnerHTML={{ __html: contentLinked }}
                                                    />
                                                )}
                        {/* Client decorators for anchors, code copy, quote share */}
                        <ContentDecorators selector=".wp-content" />

                        {/* 🚀 NEW: Article tags section */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">TAGS</h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <Link key={tag.id} href={`/tag/${tag.slug}`}>
                                            <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                                #{tag.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Enhanced Related sidebar */}
                    <aside className="lg:col-span-2 self-start">
                                                    <div className="bg-card p-6 rounded-lg shadow-lg">
                                                        <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Failed to load related posts.</div>}>
                                                            <RelatedPostsSidebar
                                                                    currentPostId={Number(post.id)}
                                                                    currentPostCategories={post.categories?.map(c => ({ id: c.id, name: c.name || '', slug: c.slug || '' }))}
                                                                    currentPostTags={post.tags?.map(t => ({ id: t.id, name: t.name || '', slug: t.slug || '' }))}
                                                            />
                                                        </ErrorBoundary>
                                                    </div>

                                            {/* 🚀 NEW: Author's latest posts */}
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

                        {/* 🚀 NEW: Newsletter signup in sidebar */}
                        <div className="mt-6 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg border">
                            <h3 className="font-semibold mb-2">📬 Stay Updated</h3>
                            <p className="text-sm text-muted-foreground mb-4">Get the latest posts delivered right to your inbox.</p>
                            <div className="space-y-2">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button className="w-full bg-primary text-primary-foreground px-3 py-2 text-sm rounded-md hover:bg-primary/90 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
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

                {/* Comments section */}
                <div className="max-w-4xl mx-auto">
                                        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading comments...</div>}> 
                                            <CommentsSection postId={Number(post.id)} />
                                        </Suspense>
                </div>

                {/* 🚀 ENHANCED: Recommended posts with rich cards */}
                {recommended.length > 0 ? (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">📚 Recommended for you</h2>
                            <Link href="/blog" className="text-sm text-primary hover:underline">
                                View all posts →
                            </Link>
                        </div>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {recommended.map(r => (
                                <Link key={r.id} href={`/blog/${r.slug}`} className="group">
                                    <div className="h-full rounded-lg border bg-card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                                        {/* Featured image for recommendations */}
                                        {r.featuredImage && (
                                            <div className="relative aspect-video w-full overflow-hidden">
                                                <Image
                                                    src={r.featuredImage}
                                                    alt={r.title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                {r.title}
                                            </h3>
                                            {r.excerpt && (
                                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                                    {r.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{r.authorName || 'Unknown'}</span>
                                                <div className="flex items-center gap-3">
                                                    {r.date && (
                                                        <span>{new Date(r.date).toLocaleDateString()}</span>
                                                    )}
                                                    {r.readingTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {r.readingTime}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* 🚀 NEW: Fallback when no recommendations */
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">📚 Explore More</h2>
                        <div className="bg-muted/30 p-8 rounded-lg text-center">
                            <p className="text-muted-foreground mb-4">Looking for more great content?</p>
                            <Link 
                                href="/blog" 
                                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Browse All Posts →
                            </Link>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
}