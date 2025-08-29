
import { cn } from "@/lib/utils";
import { PostCard } from "./post-card";
import { getPosts } from "@/lib/wp";

type FeedProps = {
  layout?: 'grid' | 'list';
  postCount?: number;
};

export default async function Feed({ layout = 'grid', postCount = 6 }: FeedProps) {
  const { items } = await getPosts({ page: 1, perPage: postCount });

  const wrapperClass = cn(
    "grid gap-6",
    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
  );

  return (
    <div className={wrapperClass}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts available.</p>
      ) : (
        items.map((p) => (
          <PostCard
            key={p.id}
            layout={layout as any}
            post={{
              id: String(p.id),
              title: p.title,
              author: p.authorName || 'Unknown',
              avatar: p.authorAvatar || '/favicon.ico',
              imageUrl: p.featuredImage || '/favicon.ico',
              imageHint: 'featured image',
              excerpt: (p.excerptHtml || '').replace(/<[^>]+>/g, '').slice(0, 180),
              slug: p.slug,
              date: p.date,
            }}
          />
        ))
      )}
    </div>
  );
}
