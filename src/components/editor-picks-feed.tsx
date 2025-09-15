import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { htmlToText } from "@/lib/text";
import { getPostsByIds, getPosts } from "@/lib/wp";
import { getSettings } from "@/lib/settings";

import { PostCard } from "./post-card";

type EditorPicksFeedProps = {
  layout?: 'grid' | 'list';
  fallbackCount?: number;
};

export default async function EditorPicksFeed({ layout = 'grid', fallbackCount = 3 }: EditorPicksFeedProps) {
  let editorPicksPosts: Awaited<ReturnType<typeof getPostsByIds>> = []
  
  try {
    // Get editor picks from settings
    const settings = await getSettings()
    const editorPicksIds = settings.editorPicks || []
    
    if (editorPicksIds.length > 0) {
      // Fetch posts by their IDs
      editorPicksPosts = await getPostsByIds(editorPicksIds)
    }
  } catch (error) {
    console.error('Failed to fetch editor picks:', error)
    // Fall through to show fallback or empty state
  }

  // If no editor picks or fetching failed, show fallback from latest posts
  if (editorPicksPosts.length === 0 && fallbackCount > 0) {
    try {
      const { items } = await getPosts({ page: 1, perPage: fallbackCount });
      
      editorPicksPosts = items.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerptHtml: p.excerptHtml,
        featuredImage: p.featuredImage,
        authorId: p.authorId,
        authorName: p.authorName,
        authorAvatar: p.authorAvatar,
        authorSlug: p.authorSlug,
        date: p.date,
      }))
    } catch (error) {
      console.error('Failed to fetch fallback posts:', error)
    }
  }

  const wrapperClass = cn(
    "grid gap-6",
    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
  );

  return (
    <div className={wrapperClass}>
      {editorPicksPosts.length === 0 ? (
        <div className="col-span-full border rounded-md p-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Info className="h-4 w-4" />
          </div>
          <p className="mb-1 font-medium text-foreground">No editor picks yet</p>
          <p>Posts will appear once admin sets editor picks. Showing latest posts as fallback.</p>
        </div>
      ) : (
        editorPicksPosts.map((p) => (
          <PostCard
            key={p.id}
            layout={layout}
            post={{
              id: String(p.id),
              title: p.title,
              author: p.authorName || 'Unknown',
              avatar: p.authorAvatar || '/favicon.ico',
              imageUrl: p.featuredImage || '/favicon.ico',
              imageHint: 'featured image',
              excerpt: htmlToText(p.excerptHtml || '').slice(0, 180),
              slug: p.slug,
              date: p.date,
            }}
          />
        ))
      )}
    </div>
  );
}