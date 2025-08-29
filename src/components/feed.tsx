
import { cn } from "@/lib/utils";
import { PostCard } from "./post-card";
import { dummyPosts } from "@/data/dummy-posts";

type FeedProps = {
  layout?: 'grid' | 'list';
  postCount?: number;
};

export default async function Feed({ layout = 'grid', postCount = 6 }: FeedProps) {
  // Using dummy data for frontend design
  const posts = dummyPosts.slice(0, postCount);

  const wrapperClass = cn(
    "grid gap-6",
    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
  );

  return (
    <div className={wrapperClass}>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts available.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} layout={layout as any} />)
      )}
    </div>
  );
}
