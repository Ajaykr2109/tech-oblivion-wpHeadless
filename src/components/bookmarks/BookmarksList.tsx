import { CheckSquare, Square, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthorLink } from '@/components/common/AuthorLink';

type Bookmark = {
  id: number;
  link: string;
  title?: string;
  date: string;
  slug: string;
  count?: number;
  author?: {
    name: string;
    slug: string;
  };
  tags?: Array<{ name: string; slug: string }>;
  categories?: Array<{ name: string; slug: string }>;
  excerpt?: string;
  type?: 'post' | 'page';
};

type ViewMode = 'grid' | 'list';

interface BookmarksListProps {
  bookmarks: Bookmark[];
  viewMode: ViewMode;
  isSelecting: boolean;
  selectedItems: Set<number>;
  onToggleSelection: (id: number) => void;
  onRemoveBookmark: (id: number) => void;
}

export function BookmarksList({
  bookmarks,
  viewMode,
  isSelecting,
  selectedItems,
  onToggleSelection,
  onRemoveBookmark,
}: BookmarksListProps) {
  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            No bookmarks match your current filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {bookmarks.map(bookmark => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          viewMode={viewMode}
          isSelecting={isSelecting}
          isSelected={selectedItems.has(bookmark.id)}
          onToggleSelection={() => onToggleSelection(bookmark.id)}
          onRemove={() => onRemoveBookmark(bookmark.id)}
        />
      ))}
    </div>
  );
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: ViewMode;
  isSelecting: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onRemove: () => void;
}

function BookmarkCard({
  bookmark,
  viewMode,
  isSelecting,
  isSelected,
  onToggleSelection,
  onRemove,
}: BookmarkCardProps) {
  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${viewMode === 'list' ? 'hover:bg-muted/30' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection checkbox */}
          {isSelecting && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto flex-shrink-0"
              onClick={onToggleSelection}
              aria-label={isSelected ? 'Deselect bookmark' : 'Select bookmark'}
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
          )}

          <div className="flex-1 min-w-0">
            {/* Title and link */}
            <h3 className={`font-medium mb-2 ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}`}>
              <a 
                href={bookmark.link} 
                className="hover:text-primary transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                {bookmark.title || `Post #${bookmark.id}`}
              </a>
            </h3>

            {/* Excerpt - only show in grid view or if list view has space */}
            {bookmark.excerpt && viewMode === 'grid' && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {bookmark.excerpt}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <time dateTime={bookmark.date}>
                {new Date(bookmark.date).toLocaleDateString()}
              </time>
              
              {bookmark.author && (
                <>
                  <span>•</span>
                  <AuthorLink 
                    name={bookmark.author.name}
                    slug={bookmark.author.slug}
                    className="hover:text-primary transition-colors"
                  />
                </>
              )}
              
              {bookmark.type && (
                <>
                  <span>•</span>
                  <span className="capitalize">{bookmark.type}</span>
                </>
              )}
              
              {typeof bookmark.count === 'number' && bookmark.count > 1 && (
                <>
                  <span>•</span>
                  <span>{bookmark.count} saves</span>
                </>
              )}
            </div>

            {/* Tags - show more in grid view */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, viewMode === 'grid' ? 4 : 2).map(tag => (
                  <Badge key={tag.slug} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {bookmark.tags.length > (viewMode === 'grid' ? 4 : 2) && (
                  <Badge variant="outline" className="text-xs">
                    +{bookmark.tags.length - (viewMode === 'grid' ? 4 : 2)} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label="Remove bookmark"
              className="text-muted-foreground hover:text-destructive p-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
