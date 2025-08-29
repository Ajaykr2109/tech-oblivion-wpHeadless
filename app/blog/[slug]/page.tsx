
import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { parse } from 'node-html-parser'
import { notFound } from 'next/navigation'
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar'
import { sanitizeWP } from '@/lib/sanitize'
import { getSettings } from '@/lib/settings'
import { getPostBySlug } from '@/lib/wp'
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { slug } = params
    const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()])
    if (!post) return { title: slug }
    const desc = (post.seo?.description || post.contentHtml?.replace(/<[^>]+>/g, '').slice(0, 160) || undefined)
    const canonical = `${settings.siteUrl.replace(/\/$/, '')}/blog/${post.slug}`
    const title = post.seo?.title || post.title || settings.siteTitle
    const image = post.seo?.ogImage || post.featuredImage || settings.defaultOgImage

    return {
      title,
      description: desc,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        title,
        description: desc || undefined,
        url: canonical,
        images: image ? [image] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc || undefined,
        images: (post.seo?.twitterImage || settings.defaultTwitterImage || image) ? [post.seo?.twitterImage || settings.defaultTwitterImage || image!] : undefined,
      },
    }
  } catch (err: any) {
    console.error('generateMetadata error:', err)
    const { slug } = params
    return { title: slug }
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // Initialize highlight.js server-side
  // This ensures that code blocks are highlighted on initial render
  hljs.configure({ ignoreUnescapedHTML: true }) // Optional: configure to ignore HTML in code blocks
  
  let post: any = null

  try {
    const { slug } = params
    post = await getPostBySlug(slug)
  } catch (err: any) {
    console.error('Error fetching post:', err)
  }

  if (!post) {
    notFound()
  }


  // Calculate reading time
  const wordsPerMinute = 225;
  const content = post.contentHtml ? post.contentHtml.replace(/<[^>]+>/g, '').trim() : '';
  const wordCount = content.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  const readingTime = `${readingTimeMinutes} min read`;

  // Generate Table of Contents
  const root = parse(post.contentHtml || '');
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');

  const tableOfContents = headings.map((heading: any, index: number) => {
    const text = heading.text.trim();
    // Create a simple slug from the text for the anchor link
    const slug = text.toLowerCase().replace(/[^a-z0-9\s]+/g, '').trim().replace(/\s+/g, '-');
    // Add an id to the original heading for linking
    heading.setAttribute('id', slug);
    return {
      level: parseInt(heading.tagName.replace('H', '')),
      text,
      slug,
    };
  });

  // Apply syntax highlighting to code blocks
  root.querySelectorAll('pre code').forEach((block: any) => {
    const text = block.textContent; // Use textContent to get the code without HTML entities
    if (text) {
        const highlightedHtml = hljs.highlightAuto(text).value;
        block.innerHTML = highlightedHtml; // Set the highlighted HTML back
    }
  });

  // Note: Skipping inline related-post injection to avoid runtime errors and keep content stable.

  // Use the modified HTML content for rendering, including the added IDs for TOC
  // Sanitize the HTML while allowing common formatting tags and attributes
  const contentWithTocAnchorsAndHighlights = sanitizeWP(root.innerHTML)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* JSON-LD (rendered in body; search engines still parse this) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': post.seo?.schemaType || 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
        }) }}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        <article className="w-full lg:w-3/4 max-w-4xl lg:mx-0 mx-auto bg-card/50 p-6 md:p-8 rounded-lg shadow-lg">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.featuredImage && (
              <div className="relative w-full max-w-2xl mx-auto mb-6">
                 <Image
                  src={post.featuredImage}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full"
                  priority
                />
              </div>
            )}
            <p className="text-muted-foreground mt-4">
              Published on {new Date(post.date).toLocaleDateString()} • {readingTime}
            </p>
          </header>

          {tableOfContents.length > 0 && (
            <div className="mb-8 p-4 border-l-4 border-primary bg-secondary/50 rounded-r-lg">
              <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
              <ul className="list-disc pl-5">
                {tableOfContents.map((item: { slug: string; text: string; level: number }, index: number) => (
                  <li key={item.slug} className={`mb-1 text-base level-${item.level}`}>
                    <a href={`#${item.slug}`} className="text-primary hover:underline">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="prose dark:prose-invert max-w-none mx-auto [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-4 [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg"
            dangerouslySetInnerHTML={{ __html: contentWithTocAnchorsAndHighlights || '' }}
          />
        </article>
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-8 bg-card/50 p-6 rounded-lg shadow-lg">
            <RelatedPostsSidebar
              currentPostId={post.id}
              currentPostCategories={Array.isArray(post.categories) ? post.categories : []}
              currentPostTags={Array.isArray(post.tags) ? post.tags : []}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
