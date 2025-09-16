import Link from "next/link";
import { Calendar, Clock, ArrowRight, Eye } from "lucide-react";

import ClientImage from "@/components/ui/client-image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
      <article aria-labelledby={`post-title-${post.id}`} className="group">
        <Link href={`/blog/${post.slug}`} className="block">
          <Card className="card-premium flex flex-col sm:flex-row overflow-hidden items-start cursor-pointer p-4">
            <div className="relative aspect-video sm:aspect-square h-32 w-full sm:w-32 flex-shrink-0 overflow-hidden rounded-xl">
              <ClientImage
                src={post.imageUrl}
                alt={`Image for ${post.title}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 128px"
                loading="lazy"
                data-ai-hint={post.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col justify-between p-4 flex-grow">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    Featured
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>2.4k views</span>
                  </div>
                </div>
                <CardTitle id={`post-title-${post.id}`} className="text-lg leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xs">
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{post.author}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </div>
          </Card>
        </Link>
      </article>
    );
  }

  return (
    <article aria-labelledby={`post-title-${post.id}`} className="group">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card className="card-premium flex h-full flex-col overflow-hidden cursor-pointer">
          <CardHeader className="p-0 relative overflow-hidden">
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <ClientImage
                src={post.imageUrl}
                alt={`Image for ${post.title}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                data-ai-hint={post.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">
                  Featured
                </Badge>
              </div>
              
              {/* Reading time estimate */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Clock className="h-3 w-3 text-white" />
                <span className="text-xs text-white">5 min read</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>2.4k views</span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            
            <CardTitle id={`post-title-${post.id}`} className="text-xl line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-3 leading-tight">
              {post.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 leading-relaxed text-muted-foreground">
              {post.excerpt}
            </CardDescription>
          </CardContent>
          
          <CardFooter className="p-6 pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={post.avatar} alt={post.author} />
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {post.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{post.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </article>
  );
}
