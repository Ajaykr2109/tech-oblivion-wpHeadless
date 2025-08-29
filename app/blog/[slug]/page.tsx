import React from 'react'
import { Metadata } from 'next'
import { getPostBySlug, getPosts, Post } from '@/lib/wp'
import { parse } from 'node-html-parser';
import { notFound } from 'next/navigation'
import Link from 'next/link';

import Image from 'next/image'
import hljs from 'highlight.js';
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar';
import 'highlight.js/styles/github-dark.css'; // Or any other style you prefer

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)
    if (!post) return { title: slug }
    return {
      title: post.title || slug,
      description: post.contentHtml ? post.contentHtml.replace(/<[^>]+>/g, '').slice(0, 160) : undefined,
      openGraph: post.featuredImage ? { images: [post.featuredImage] } : undefined,
    }
  } catch (err: any) {
    console.error('generateMetadata error:', err)
    const { slug } = await params
    return { title: slug }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Initialize highlight.js server-side
  // This ensures that code blocks are highlighted on initial render
  hljs.configure({ ignoreUnescapedHTML: true }); // Optional: configure to ignore HTML in code blocks
  
  let post: any = null

  try {
    const { slug } = await params
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

  const tableOfContents = headings.map((heading, index) => {
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
  root.querySelectorAll('pre code').forEach(block => {
    const text = block.textContent; // Use textContent to get the code without HTML entities
    if (text) {
        const highlightedHtml = hljs.highlightAuto(text).value;
        block.innerHTML = highlightedHtml; // Set the highlighted HTML back
    }
  });

  // Ensure featured image URL is correct
  const featuredImageUrl = post.featuredImage ? post.featuredImage.replace('/api/wp/media/', 'https://techoblivion.in/') : null;

  // Fetch related posts for injection (limiting to a small number)
  const relatedPostsForInjection = await getPosts({
    perPage: 3, // Fetch a small number of posts for injection
    exclude: [post.id], // Exclude the current post
    // Ensure categories and tags are valid arrays before mapping
    // This prevents errors if a post somehow lacks these properties
    // @ts-ignore - Assuming categories and tags are in the post object structure
    categories: post.categories.map((cat: any) => cat.id), // Match by categories
    tags: post.tags.map((tag: any) => tag.id), // Match by tags
    _embed: true, // Embed featured image and other details
  });

  // Inject related posts subtly into paragraphs
  const paragraphs = root.querySelectorAll('p');
  if (relatedPostsForInjection && Array.isArray(relatedPostsForInjection.items)) {
    // Ensure we don't inject more links than there are paragraphs or related posts
    if (index < paragraphs.length) {
      const injectParagraphIndex = Math.floor(paragraphs.length / (relatedPostsForInjection.length + 1)) * (index + 1);
      const paragraphToInjectInto = paragraphs[injectParagraphIndex];
      if (paragraphToInjectInto) {
        const relatedPostLinkHtml = `
          <div class="my-6 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 italic">
            Looking for more? Read: <a href="/blog/${relatedPost.slug}" class="text-blue-700 dark:text-blue-300 hover:underline">${relatedPost.title}</a>
          </div>
        `;
        // Insert the related post link after the chosen paragraph
        paragraphToInjectInto.insertAdjacentHTML('afterend', relatedPostLinkHtml);
      }
    }
  }

  // Use the modified HTML content for rendering, including the added IDs for TOC
  const contentWithTocAnchorsAndHighlights = root.innerHTML;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <article className="w-full lg:w-3/4 max-w-4xl lg:mx-0 mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.featuredImage && (
              <div className="relative w-full max-w-2xl mx-auto mb-6">
                 <Image
                  src={post.featuredImage.replace('/api/wp/media/', 'https://techoblivion.in/')}
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
            <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
              <ul className="list-disc pl-5">
                {tableOfContents.map((item, index) => (
                  <li key={item.slug} className={`mb-1 text-base level-${item.level}`}>
                    <a href={`#${item.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="max-w-none [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-4 [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4"
            className="prose dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{
              __html: contentWithTocAnchorsAndHighlights
                ?.replace(/src="\/api\/wp\/media\//g, 'src="https://techoblivion.in/')
                ?.replace(/src="\/wp-content\//g, 'src="https://techoblivion.in/wp-content/') || ''
            }}
          />
        </article>
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-8"> {/* Adjust top value as needed */}
            <RelatedPostsSidebar currentPostId={post.id} currentPostCategories={post.categories} currentPostTags={post.tags} />
          </div>
        </aside>
      </div>
    </div>
  );
}
