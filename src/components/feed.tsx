
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { htmlToText } from "@/lib/text";
import { getPosts } from "@/lib/wp";
import { calculatePostReadingTime, formatReadingTime } from "@/lib/reading-time";

import { PostCard } from "./post-card";

type FeedProps = {
  layout?: 'grid' | 'list' | 'simple';
  postCount?: number;
};

export default async function Feed({ layout = 'grid', postCount = 6 }: FeedProps) {
  // ⚡ Optimize with shorter revalidation for better performance
  const { items } = await getPosts({ page: 1, perPage: postCount });

  const wrapperClass = cn(
    "grid",
    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : 
    layout === 'simple' ? "grid-cols-1 gap-2" : 
    "grid-cols-1 gap-4"
  );

  return (
    <div className={wrapperClass}>
      {items.length === 0 ? (
        <div className="col-span-full border rounded-md p-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Info className="h-4 w-4" />
          </div>
          <p className="mb-1 font-medium text-foreground">Nothing here yet</p>
          <p>Posts will appear once published. Please check back soon.</p>
        </div>
      ) : (
        items.map((p) => {
          // Calculate reading time from full content, fallback to excerpt
          const contentForReading = p.contentHtml || p.excerptHtml || '';
          const readingTime = calculatePostReadingTime(
            p.title,
            contentForReading
          );
          
          return (
            <PostCard
              key={p.id}
              layout={layout}
              showFeatured={false}
              post={{
                id: String(p.id),
                title: p.title,
                author: p.authorName || 'Unknown',
                authorSlug: p.authorSlug || undefined,
                avatar: p.authorAvatar || '/favicon.ico',
                imageUrl: p.featuredImage || '/favicon.ico',
                imageHint: 'featured image',
                excerpt: htmlToText(p.excerptHtml || '').slice(0, 180),
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
