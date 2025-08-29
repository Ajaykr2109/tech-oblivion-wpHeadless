
import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { notFound } from 'next/navigation'
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar'
import { dummyPosts } from '@/data/dummy-posts'

// This function can remain as-is for now, as it's for SEO and doesn't block rendering.
// In a real app, this would fetch live data.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = dummyPosts.find(p => p.slug === params.slug)
  if (!post) {
    return { title: 'Post not found' }
  }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = dummyPosts.find(p => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  // Dummy content for demonstration
  const dummyContentHtml = `
    <p>This is the beginning of a beautiful blog post titled "${post.title}". The content here is a placeholder to demonstrate the page structure.</p>
    <h2>Understanding the Core Concept</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.</p>
    <pre><code class="language-javascript">
    // Example code block
    function greet(name) {
      console.log(\`Hello, \${name}!\`);
    }
    greet('World');
    </code></pre>
    <h3>Further Details</h3>
    <p>Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
    <ul>
      <li>First list item</li>
      <li>Second list item</li>
      <li>Third list item</li>
    </ul>
    <blockquote>Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.</blockquote>
  `;

  // Calculate reading time from dummy content
  const wordsPerMinute = 225;
  const wordCount = dummyContentHtml.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  const readingTime = `${readingTimeMinutes} min read`;

  // Dummy Table of Contents
  const tableOfContents = [
    { level: 2, text: "Understanding the Core Concept", slug: "understanding-the-core-concept" },
    { level: 3, text: "Further Details", slug: "further-details" },
  ];

  // In a real scenario, you'd parse dummyContentHtml to generate the TOC and apply highlighting.
  // For this template, we'll use the pre-formatted content.
  const highlightedContent = dummyContentHtml.replace(/<pre><code class="language-javascript">([\s\S]*?)<\/code><\/pre>/, (match, code) => {
    const highlighted = hljs.highlight(code, { language: 'javascript' }).value;
    return `<pre><code class="hljs language-javascript">${highlighted}</code></pre>`;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <article className="w-full lg:w-3/4 max-w-4xl lg:mx-0 mx-auto bg-card p-6 md:p-8 rounded-lg shadow-lg">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.imageUrl && (
              <div className="relative w-full max-w-2xl mx-auto mb-6">
                 <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full"
                  priority
                  data-ai-hint={post.imageHint}
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
                {tableOfContents.map((item) => (
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
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </article>
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-8 bg-card p-6 rounded-lg shadow-lg">
            {/* The RelatedPostsSidebar will use client-side fetching which is fine for a template */}
            <RelatedPostsSidebar
              currentPostId={Number(post.id)}
              currentPostCategories={[]}
              currentPostTags={[]}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
