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
        <Card className="card-premium overflow-hidden">
          <div className="relative">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-video w-full overflow-hidden cursor-pointer">
                <ClientImage
                  src={post.imageUrl}
                  alt={`Image for ${safeTitle}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                {/* Subtle hover veil */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Cinematic bottom gradient (~35%) with via stop; light/dark */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-white/80 via-white/30 to-transparent dark:from-black/70 dark:via-black/30 dark:to-transparent" />
                {/* Content inside gradient zone (title/excerpt only to avoid nested links) */}
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1">
                  <CardTitle id={`post-title-${post.id}`} className="text-white text-base sm:text-lg leading-tight line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                    {safeTitle}
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-white/90 text-[0.9rem] leading-snug line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                    {safeExcerpt}
                  </CardDescription>
                </div>

                {/* Optional floating badges for list too */}
                {showFeatured && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">Featured</Badge>
                  </div>
                )}
              </div>
            </Link>
            {/* Meta bar moved outside Link to prevent nested anchors */}
            <div className="p-4 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="truncate text-right">
                {post.authorSlug ? (
                  <Link href={`/profile/${post.authorSlug}`} className="hover:underline">
                    {post.author}
                  </Link>
                ) : (
                  <span>{post.author}</span>
                )}
              </div>
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
                className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              {/* Subtle hover veil */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Cinematic bottom gradient (~35%) with via stop; light/dark */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-white/80 via-white/30 to-transparent dark:from-black/70 dark:via-black/30 dark:to-transparent" />
              {/* Text sits directly within gradient zone (title/excerpt only) */}
              <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1">
                <CardTitle id={`post-title-${post.id}`} className="text-white text-lg sm:text-xl leading-tight line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                  {safeTitle}
                </CardTitle>
                <CardDescription className="mt-2 text-white/90 text-sm sm:text-[0.95rem] leading-snug line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                  {safeExcerpt}
                </CardDescription>
              </div>

              {/* Floating badges */}
              {showFeatured && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">Featured</Badge>
                </div>
              )}

              {/* Reading time estimate */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                <Clock className="h-3 w-3 text-white" />
                <span className="text-xs text-white">{readingTimeText}</span>
              </div>
            </div>
          </Link>
        </CardHeader>

        {/* Meta section moved outside Link to avoid nested anchors */}
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              {viewsText && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{viewsText}</span>
                </>
              )}
            </div>
            <div className="truncate text-right">
              {post.authorSlug ? (
                <Link href={`/profile/${post.authorSlug}`} className="hover:underline">
                  {post.author}
                </Link>
              ) : (
                <span>{post.author}</span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-2 pt-0" />
      </Card>
    </article>
  );
}
