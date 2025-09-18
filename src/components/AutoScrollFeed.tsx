"use client";
import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { htmlToText } from "@/lib/text";
import { calculatePostReadingTime, formatReadingTime } from "@/lib/reading-time";

import { PostCard } from "./post-card";

type AutoScrollFeedProps = {
  layout?: 'grid' | 'list';
  postCount?: number;
  autoScrollInterval?: number; // in milliseconds
};

interface Post {
  id: number;
  title: {
    rendered: string;
  } | string;
  slug: string;
  excerpt?: {
    rendered: string;
  } | string;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    author?: Array<{
      id: number;
      name: string;
      avatar_urls?: {
        '48': string;
        '96': string;
      };
    }>;
  };
  author?: number;
  date: string;
}

export default function AutoScrollFeed({ 
  layout = 'list', 
  postCount = 6,
  autoScrollInterval = 3000 
}: AutoScrollFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/wp/posts?per_page=${postCount}&page=1&_embed=1`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [postCount]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!posts.length || isHovered) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

      if (isAtBottom) {
        // Scroll back to top
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll down by one post height (approximately)
        const postHeight = container.querySelector('[data-post-item]')?.clientHeight || 120;
        container.scrollBy({ top: postHeight + 16, behavior: 'smooth' }); // 16px for gap
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [posts, autoScrollInterval, isHovered]);

  const wrapperClass = cn(
    "h-full flex flex-col space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
    "pr-2" // Add padding for scrollbar
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading posts...</div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className={wrapperClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {posts.length === 0 ? (
        <div className="border rounded-md p-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Info className="h-4 w-4" />
          </div>
          <p className="mb-1 font-medium text-foreground">Nothing here yet</p>
          <p>Posts will appear once published. Please check back soon.</p>
        </div>
      ) : (
        posts.map((p) => {
          // Helper function to extract string from WordPress API response
          const getRenderedText = (field: string | { rendered: string } | undefined): string => {
            if (!field) return '';
            if (typeof field === 'string') return field;
            return field.rendered || '';
          };

          // Extract author info from embedded data
          const authorData = p._embedded?.author?.[0];
          const featuredImageData = p._embedded?.['wp:featuredmedia']?.[0];

          // Calculate reading time
          const contentForReading = getRenderedText(p.excerpt) || '';
          const readingTime = calculatePostReadingTime(
            getRenderedText(p.title),
            contentForReading
          );

          return (
            <div key={p.id} data-post-item className="flex-shrink-0">
              <PostCard
                layout={layout}
                showFeatured={false}
                post={{
                  id: String(p.id),
                  title: getRenderedText(p.title),
                  author: authorData?.name || 'Unknown',
                  avatar: authorData?.avatar_urls?.['96'] || authorData?.avatar_urls?.['48'] || '/favicon.ico',
                  imageUrl: featuredImageData?.source_url || '/favicon.ico',
                  imageHint: 'featured image',
                  excerpt: htmlToText(getRenderedText(p.excerpt)).slice(0, 120),
                  slug: p.slug,
                  date: p.date,
                  content: contentForReading,
                  readingTime: formatReadingTime(readingTime),
                }}
              />
            </div>
          );
        })
      )}
    </div>
  );
}