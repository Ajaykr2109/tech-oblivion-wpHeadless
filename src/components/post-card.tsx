"use client";
import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";

import ClientImage from "@/components/ui/client-image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
// Removed unused Avatar imports since we no longer show avatars
import { Badge } from "@/components/ui/badge";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import { decodeEntities } from "@/lib/entities";

export type Post = {
  id: string;
  title: string;
  author: string;
  authorSlug?: string; // For linking to author profiles
  avatar: string;
  imageUrl: string;
  imageHint: string;
  excerpt: string;
  slug: string;
  date: string;
  content?: string; // For reading time calculation
  views?: number; // View count
  readingTime?: string; // Pre-calculated reading time
};

type PostCardProps = {
  post: Post;
  layout?: 'grid' | 'list' | 'simple';
  showFeatured?: boolean;
};

export function PostCard({ post, layout = 'grid', showFeatured = false }: PostCardProps) {
  // Calculate reading time if not provided
  const readingTimeText = post.readingTime || formatReadingTime(
    calculateReadingTime(post.content || post.excerpt || post.title)
  );
  // Decode any HTML entities in title/excerpt coming from WP
  const safeTitle = decodeEntities(post.title || '');
  const safeExcerpt = decodeEntities(post.excerpt || '');
  
  // Format view count
  const viewsText = post.views !== undefined 
    ? `${post.views.toLocaleString()} views`
    : undefined;

  if (layout === 'simple') {
    return (
      <article aria-labelledby={`post-title-${post.id}`} className="group">
        <Card className="card-premium p-3 h-[120px] flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <Link href={`/blog/${post.slug}`} className="flex-1 min-h-0 block">
            <CardTitle id={`post-title-${post.id}`} className="text-sm leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2 cursor-pointer">
              {safeTitle}
            </CardTitle>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed cursor-pointer">
              {safeExcerpt}
            </p>
          </Link>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {post.authorSlug ? (
              <Link href={`/profile/${post.authorSlug}`} className="text-xs font-medium text-right hover:text-primary transition-colors">
                {post.author}
              </Link>
            ) : (
              <p className="text-xs font-medium text-right">{post.author}</p>
            )}
          </div>
        </Card>
      </article>
    );
  }

  if (layout === 'list') {
    return (
      <article aria-labelledby={`post-title-${post.id}`} className="group">
        <Card className="card-premium flex flex-col sm:flex-row overflow-hidden items-start p-4">
          <Link href={`/blog/${post.slug}`} className="block sm:flex-shrink-0">
            <div className="relative aspect-video sm:aspect-square h-32 w-full sm:w-32 flex-shrink-0 overflow-hidden rounded-xl cursor-pointer">
              <ClientImage
                src={post.imageUrl}
                alt={`Image for ${safeTitle}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 128px"
                priority={false}
                data-ai-hint={post.imageHint}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/favicon.ico') {
                    target.src = '/favicon.ico';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Soft bottom-to-top blend to remove sharp seam */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/95 via-card/70 via-40% to-transparent backdrop-blur-[2px]"></div>
            </div>
          </Link>
          <div className="flex flex-col justify-between p-4 flex-grow">
            <div>
              {showFeatured && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    Featured
                  </Badge>
                  {viewsText && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{viewsText}</span>
                    </div>
                  )}
                </div>
              )}
              <Link href={`/blog/${post.slug}`} className="block">
                <CardTitle id={`post-title-${post.id}`} className="text-lg leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2 cursor-pointer">
                  {safeTitle}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed cursor-pointer">
                  {safeExcerpt}
                </p>
              </Link>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {post.authorSlug ? (
                <Link href={`/profile/${post.authorSlug}`} className="text-sm font-medium hover:text-primary transition-colors">
                  {post.author}
                </Link>
              ) : (
                <p className="text-sm font-medium">{post.author}</p>
              )}
            </div>
          </div>
        </Card>
      </article>
    );
  }

  return (
    <article aria-labelledby={`post-title-${post.id}`} className="group">
      <Card className="card-premium flex h-full flex-col overflow-hidden">
        <CardHeader className="p-0 relative overflow-hidden">
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative aspect-[3/2] w-full overflow-hidden cursor-pointer">
              <ClientImage
                src={post.imageUrl}
                alt={`Image for ${safeTitle}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                data-ai-hint={post.imageHint}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/favicon.ico') {
                    target.src = '/favicon.ico';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Soft bottom-to-top blend to remove sharp seam */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/95 via-card/70 via-40% to-transparent backdrop-blur-[2px]"></div>
              
              {/* Floating badges */}
              {showFeatured && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">
                    Featured
                  </Badge>
                </div>
              )}
              
              {/* Reading time estimate */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Clock className="h-3 w-3 text-white" />
                <span className="text-xs text-white">{readingTimeText}</span>
              </div>
            </div>
          </Link>
        </CardHeader>
        
        <CardContent className="flex-grow p-6">
          <div className="flex items-center gap-2 mb-3">
            {viewsText && (
              <>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{viewsText}</span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
              </>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          
          <Link href={`/blog/${post.slug}`} className="block">
            <CardTitle id={`post-title-${post.id}`} className="text-xl line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-3 leading-tight cursor-pointer">
              {safeTitle}
            </CardTitle>
            <CardDescription className="line-clamp-3 leading-relaxed text-muted-foreground cursor-pointer">
              {safeExcerpt}
            </CardDescription>
          </Link>
        </CardContent>
        
        <CardFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {post.authorSlug ? (
              <Link href={`/profile/${post.authorSlug}`} className="text-sm font-medium hover:text-primary transition-colors">
                {post.author}
              </Link>
            ) : (
              <p className="text-sm font-medium">{post.author}</p>
            )}
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}
