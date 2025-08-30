import ClientImage from "@/components/ui/client-image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type Post = {
  id: string;
  title: string;
  author: string;
  avatar: string;
  imageUrl: string;
  imageHint: string;
  excerpt: string;
  slug: string;
  date: string;
};

type PostCardProps = {
  post: Post;
  layout?: 'grid' | 'list';
};

export function PostCard({ post, layout = 'grid' }: PostCardProps) {

  if (layout === 'list') {
    return (
      <article aria-labelledby={`post-title-${post.id}`}>
        <Link href={`/blog/${post.slug}`} className="block">
          <Card className="flex flex-col sm:flex-row overflow-hidden border-none shadow-none items-start cursor-pointer hover:bg-card p-2 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-primary/20">
            <div className="relative aspect-video sm:aspect-square h-24 w-full sm:w-24 flex-shrink-0">
              <ClientImage
                src={post.imageUrl}
                alt={`Image for ${post.title}`}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 640px) 100vw, 96px"
                loading="lazy"
                data-ai-hint={post.imageHint}
              />
            </div>
            <div className="flex flex-col p-4">
               <CardTitle id={`post-title-${post.id}`} className="text-md leading-tight">
                {post.title}
              </CardTitle>
               <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center space-x-3 mt-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.avatar} alt={post.author} />
                  <AvatarFallback>
                    {post.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium leading-none">{post.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
          </div>
        </Card>
        </Link>
      </article>
    );
  }

  return (
    <article aria-labelledby={`post-title-${post.id}`}>
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden border-none shadow-none cursor-pointer bg-card hover:bg-card/90 p-2 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-primary/20">
          <CardHeader className="p-0">
            <div className="relative aspect-[3/2] w-full">
              <ClientImage
                src={post.imageUrl}
                alt={`Image for ${post.title}`}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                data-ai-hint={post.imageHint}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <CardTitle id={`post-title-${post.id}`} className="text-xl line-clamp-2">
              {post.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-3">{post.excerpt}</CardDescription>
          </CardContent>
          <CardFooter className="p-4">
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
                <p className="text-xs text-muted-foreground">
                   {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </article>
  );
}
