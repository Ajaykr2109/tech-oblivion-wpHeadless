import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Post = {
  id: string;
  title: string;
  author: string;
  avatar: string;
  imageUrl: string;
  imageHint: string;
  excerpt: string;
};

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article aria-labelledby={`post-title-${post.id}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/2] w-full">
            <Image
              src={post.imageUrl}
              alt={`Image for ${post.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              data-ai-hint={post.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6">
          <CardTitle id={`post-title-${post.id}`} className="text-xl">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-2">{post.excerpt}</CardDescription>
        </CardContent>
        <CardFooter>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.avatar} alt={post.author} />
              <AvatarFallback>
                {post.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{post.author}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}
