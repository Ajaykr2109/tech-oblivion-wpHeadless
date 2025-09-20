import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { htmlToText } from "@/lib/text";
import { calculatePostReadingTime, formatReadingTime } from "@/lib/reading-time";
import { safeFetchJSON } from "@/lib/safe-fetch";

import { PostCard } from "./post-card";

type CategoryFeedProps = {
  layout?: 'grid' | 'list' | 'simple';
  postCount?: number;
  categorySlug?: string;
  categoryId?: number;
};

export default async function CategoryFeed({ 
  layout = 'grid', 
  postCount = 6, 
  categorySlug,
  categoryId 
}: CategoryFeedProps) {
  let posts: unknown[] = [];
  
  try {
    // If we have categoryId, use it directly, otherwise try to resolve from slug
    if (categoryId || categorySlug) {
      let finalCategoryId = categoryId;
      
      // If we only have slug, resolve it to ID
      if (!finalCategoryId && categorySlug) {
        const categories = await safeFetchJSON<Array<{ slug: string; id: number }>>(
          `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''}/api/wp/categories`,
          { next: { revalidate: 3600 } }
        );
        const category = (categories || []).find((cat) => cat.slug === categorySlug);
        if (category) {
          finalCategoryId = category.id;
        }
      }
      
      // Fetch posts for the category
      if (finalCategoryId) {
        const data = await safeFetchJSON<unknown[]>(
          `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''}/api/wp/posts?categories=${finalCategoryId}&per_page=${postCount}&_embed=1&_t=${Date.now()}`,
          { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }
        );
        posts = Array.isArray(data) ? data : [];
      }
    }
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      // CategoryFeed: fetch error suppressed in production
    }
  }

  const wrapperClass = cn(
    "grid",
    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : 
    layout === 'simple' ? "grid-cols-1 gap-2" : 
    "grid-cols-1 gap-4"
  );

  return (
    <div className={wrapperClass}>
      {posts.length === 0 ? (
        <div className="col-span-full border rounded-md p-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Info className="h-4 w-4" />
          </div>
          <p className="mb-1 font-medium text-foreground">No articles in this category yet</p>
          <p>Articles will appear once published. Please check back soon.</p>
        </div>
      ) : (
        posts.map((post) => {
          // Type assertion for WordPress post structure
          const p = post as {
            id: number;
            slug: string;
            title?: { rendered: string };
            content?: { rendered: string };
            excerpt?: { rendered: string };
            date: string;
            _embedded?: {
              author?: Array<{ name: string; slug?: string; avatar_urls?: Record<string, string> }>;
              'wp:featuredmedia'?: Array<{ source_url: string }>;
            };
          };
          
          // Calculate reading time from full content, fallback to excerpt
          const contentForReading = p.content?.rendered || p.excerpt?.rendered || '';
          const readingTime = calculatePostReadingTime(
            p.title?.rendered || '',
            contentForReading
          );
          
          return (
            <PostCard
              key={p.id}
              layout={layout}
              showFeatured={false}
              post={{
                id: String(p.id),
                title: p.title?.rendered || '',
                author: p._embedded?.author?.[0]?.name || 'Unknown',
                authorSlug: p._embedded?.author?.[0]?.slug || undefined,
                avatar: p._embedded?.author?.[0]?.avatar_urls?.['48'] || '/favicon.ico',
                imageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/favicon.ico',
                imageHint: 'featured image',
                excerpt: htmlToText(p.excerpt?.rendered || '').slice(0, 180),
                slug: p.slug,
                date: p.date,
                content: contentForReading,
                readingTime: formatReadingTime(readingTime),
              }}
            />
          );
        })
      )}
    </div>
  );
}