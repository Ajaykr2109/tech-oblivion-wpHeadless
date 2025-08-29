import { cn } from "@/lib/utils";
import { PostCard } from "./post-card";
import { getPosts } from "@/lib/wordpress-client";

type FeedProps = {
  layout?: 'grid' | 'list';
  postCount?: number;
};

export default async function Feed({ layout = 'grid', postCount = 6 }: FeedProps) {
  const data = await getPosts({ per_page: postCount });
  const posts = data.posts.map(p => ({
    id: String(p.id),
    title: p.title.rendered,
    author: 'Tech Oblivion', // WordPress doesn't expose author in basic response
    avatar: '/favicon.ico',
    imageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/favicon.ico',
    imageHint: p._embedded?.['wp:featuredmedia']?.[0]?.alt_text || p.title.rendered,
    excerpt: p.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 240),
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
