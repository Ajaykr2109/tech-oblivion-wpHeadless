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
        <Card className="card-premium p-4 h-[140px] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <Link href={`/blog/${post.slug}`} className="flex-1 min-h-0 block">
            <CardTitle id={`post-title-${post.id}`} className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2 cursor-pointer">
              {safeTitle}
            </CardTitle>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed cursor-pointer">
              {safeExcerpt}
            </p>
          </Link>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 flex-shrink-0">
            {/* Date on bottom left */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {/* Author on bottom right */}
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
        <Card className="card-premium overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row">
            {/* Image section */}
            <div className="relative sm:w-80 flex-shrink-0">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-video sm:aspect-[4/3] w-full overflow-hidden cursor-pointer">
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
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                  {/* Optional floating badges */}
                  {showFeatured && (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm text-xs">Featured</Badge>
                    </div>
                  )}

                  {/* Reading time estimate */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                    <Clock className="h-3 w-3 text-white" />
                    <span className="text-xs text-white font-medium">{readingTimeText}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Content section */}
            <div className="flex-1 flex flex-col">
              <CardContent className="p-4 flex-1">
                <Link href={`/blog/${post.slug}`} className="block">
                  <CardTitle id={`post-title-${post.id}`} className="text-xl font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-3">
                    {safeTitle}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed line-clamp-3">
                    {safeExcerpt}
                  </CardDescription>
                </Link>
              </CardContent>

              {/* Meta section at bottom */}
              <CardFooter className="p-4 pt-0 mt-auto">
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                  {/* Date on bottom left */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {viewsText && (
                      <>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{viewsText}</span>
                      </>
                    )}
                  </div>
                  {/* Author on bottom right */}
                  <div className="text-right">
                    {post.authorSlug ? (
                      <Link href={`/profile/${post.authorSlug}`} className="font-medium hover:text-primary transition-colors duration-200">
                        {post.author}
                      </Link>
                    ) : (
                      <span className="font-medium">{post.author}</span>
                    )}
                  </div>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      </article>
    );
  }

  return (
    <article aria-labelledby={`post-title-${post.id}`} className="group">
      <Card className="card-premium flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 relative overflow-hidden">
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer">
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
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

              {/* Floating badges */}
              {showFeatured && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm text-xs">Featured</Badge>
                </div>
              )}

              {/* Reading time estimate */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                <Clock className="h-3 w-3 text-white" />
                <span className="text-xs text-white font-medium">{readingTimeText}</span>
              </div>
            </div>
          </Link>
        </CardHeader>

        {/* Content section with consistent padding */}
        <CardContent className="p-4 flex-1 flex flex-col">
          <Link href={`/blog/${post.slug}`} className="flex-1">
            <CardTitle id={`post-title-${post.id}`} className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2">
              {safeTitle}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {safeExcerpt}
            </CardDescription>
          </Link>
        </CardContent>

        {/* Meta section at bottom with consistent spacing */}
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            {/* Date on bottom left */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              {viewsText && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{viewsText}</span>
                </>
              )}
            </div>
            {/* Author on bottom right */}
            <div className="text-right">
              {post.authorSlug ? (
                <Link href={`/profile/${post.authorSlug}`} className="font-medium hover:text-primary transition-colors duration-200">
                  {post.author}
                </Link>
              ) : (
                <span className="font-medium">{post.author}</span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </article>
  );
}
