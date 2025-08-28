"use client";

import { useEffect, useState } from "react";
import { PostCard, type Post } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";
import { cn } from "@/lib/utils";

const mockPosts: Post[] = [
  {
    id: "1",
    title: "The Future of AI in Software Development",
    author: "Jane Doe",
    avatar: "https://picsum.photos/id/237/40/40",
    imageUrl: "https://picsum.photos/id/1/600/400",
    imageHint: "abstract tech",
    excerpt: "Exploring how artificial intelligence is reshaping the landscape of software engineering, from code generation to automated testing.",
  },
  {
    id: "2",
    title: "A Deep Dive into Quantum Computing",
    author: "John Smith",
    avatar: "https://picsum.photos/id/238/40/40",
    imageUrl: "https://picsum.photos/id/2/600/400",
    imageHint: "quantum computer",
    excerpt: "Unraveling the complexities of quantum mechanics and its potential to revolutionize computing as we know it.",
  },
  {
    id: "3",
    title: "Mastering the Art of Responsive Design",
    author: "Alice Johnson",
    avatar: "https://picsum.photos/id/239/40/40",
    imageUrl: "https://picsum.photos/id/3/600/400",
    imageHint: "web design",
    excerpt: "Best practices and modern techniques for building web interfaces that work seamlessly across all devices and screen sizes.",
  },
    {
    id: "4",
    title: "The Rise of Edge Computing",
    author: "Michael Brown",
    avatar: "https://picsum.photos/id/240/40/40",
    imageUrl: "https://picsum.photos/id/4/600/400",
    imageHint: "server network",
    excerpt: "How processing data closer to the source is reducing latency and powering a new generation of applications.",
  },
  {
    id: "5",
    title: "Cybersecurity in a Connected World",
    author: "Emily Clark",
    avatar: "https://picsum.photos/id/241/40/40",
    imageUrl: "https://picsum.photos/id/5/600/400",
    imageHint: "cyber security",
    excerpt: "Navigating the challenges of protecting digital assets in an era of increasing cyber threats and vulnerabilities.",
  },
  {
    id: "6",
    title: "Sustainable Technology and Green IT",
    author: "David Wilson",
    avatar: "https://picsum.photos/id/242/40/40",
    imageUrl: "https://picsum.photos/id/6/600/400",
    imageHint: "green technology",
    excerpt: "Innovations and strategies for reducing the environmental impact of technology and promoting a sustainable digital future.",
  },
];

type FeedProps = {
  layout?: 'grid' | 'list';
  postCount?: number;
};

export function Feed({ layout = 'grid', postCount = 6 }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Removed the timer to load posts instantly
    setPosts(mockPosts.slice(0, postCount));
    setLoading(false);
  }, [postCount]);

  const wrapperClass = cn(
    "grid gap-6",
    layout === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
  );


  if (loading) {
    return (
      <div className={wrapperClass}>
        {Array.from({ length: postCount }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {posts.map((post) => <PostCard key={post.id} post={post} layout={layout} />)}
    </div>
  );
}
