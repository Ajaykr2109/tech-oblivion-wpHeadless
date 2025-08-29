import { cn } from "@/lib/utils";
import { PostCard } from "./post-card";
import { getPosts } from "@/lib/wp";

type FeedProps = {
  layout?: 'grid' | 'list';
  postCount?: number;
};

export default async function Feed({ layout = 'grid', postCount = 6 }: FeedProps) {
  const data = await getPosts({ perPage: postCount })
  const posts = data.items.map(p => ({
    id: String(p.id),
    title: p.title,
    author: p.authorName || 'Unknown',
    avatar: p.authorAvatar || '/favicon.ico',
    imageUrl: p.featuredImage || '/favicon.ico',
    imageHint: p.title,
    excerpt: (p.excerptHtml || '').replace(/<[^>]+>/g, '').slice(0, 240),
  }))

  const wrapperClass = cn(
    "grid gap-6",
    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
  );

  return (
    <div className={wrapperClass}>
      {posts.map((post) => <PostCard key={post.id} post={post} layout={layout as any} />)}
    </div>
  );
}
