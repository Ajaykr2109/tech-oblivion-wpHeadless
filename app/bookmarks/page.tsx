'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search, Grid, List, Trash2, CheckSquare, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [_selectedTags, _setSelectedTags] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const { toast } = useToast();

  // Get view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('bookmarks-view-mode') as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage when changed
  useEffect(() => {
    localStorage.setItem('bookmarks-view-mode', viewMode);
  }, [viewMode]);

  // Fetch bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Filter and sort bookmarks when dependencies change
  useEffect(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title?.toLowerCase().includes(query) ||
        bookmark.excerpt?.toLowerCase().includes(query)
      );
    }

    // Tag filter (disabled for now, keeping for future implementation)
    // if (_selectedTags.length > 0) {
    //   filtered = filtered.filter(bookmark =>
    //     bookmark.tags?.some(tag => _selectedTags.includes(tag.slug))
    //   );
    // }

    // Author filter
    if (selectedAuthor) {
      filtered = filtered.filter(bookmark => bookmark.author?.slug === selectedAuthor);
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(bookmark => bookmark.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, selectedAuthor, selectedType, sortBy]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wp/bookmarks?expand=1', {
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your bookmarks.');
          return;
        }
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      setBookmarks(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: number) => {
    try {
      const response = await fetch('/api/wp/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to remove bookmark');

      setBookmarks(prev => prev.filter(b => b.id !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      toast({
        title: 'Removed',
        description: 'Bookmark removed successfully.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to remove bookmark',
        variant: 'destructive'
      });
    }
  };

  const removeSelectedBookmarks = async () => {
    if (selectedItems.size === 0) return;

    try {
      const response = await fetch('/api/wp/bookmarks/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedItems) })
      });

      if (!response.ok) throw new Error('Failed to remove bookmarks');

      setBookmarks(prev => prev.filter(b => !selectedItems.has(b.id)));
      setSelectedItems(new Set());
      setIsSelecting(false);

      toast({
        title: 'Removed',
        description: `${selectedItems.size} bookmarks removed successfully.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to remove bookmarks',
        variant: 'destructive'
      });
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(filteredBookmarks.map(b => b.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  // Get unique values for filters
  const _allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags?.map(t => t.slug) || [])));
  const allAuthors = Array.from(new Set(bookmarks.map(b => b.author?.slug).filter(Boolean))) as string[];
  const allTypes = Array.from(new Set(bookmarks.map(b => b.type).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading bookmarks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Bookmarks</h1>
          <div className="text-muted-foreground mb-6">{error}</div>
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header with navigation buttons */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="outline"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Bookmarks ({filteredBookmarks.length})
        </h1>
        
        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters and controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* Author filter */}
            {allAuthors.length > 0 && (
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Authors</SelectItem>
                  {allAuthors.map(author => (
                    <SelectItem key={author} value={author}>{author}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Type filter */}
            {allTypes.length > 0 && (
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {allTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'post' ? 'Posts' : 'Pages'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Bulk actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isSelecting ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelecting(true)}
                  disabled={filteredBookmarks.length === 0}
                >
                  Select Multiple
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeSelectedBookmarks}
                    disabled={selectedItems.size === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove ({selectedItems.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSelecting(false);
                      setSelectedItems(new Set());
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {/* Active filters display */}
            {(searchQuery || selectedAuthor || selectedType) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {selectedAuthor && (
                  <Badge variant="secondary" className="text-xs">
                    Author: {selectedAuthor}
                  </Badge>
                )}
                {selectedType && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {selectedType}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bookmarks list */}
      {filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              {bookmarks.length === 0
                ? "You haven't saved any bookmarks yet."
                : "No bookmarks match your current filters."
              }
            </div>
            {bookmarks.length === 0 && (
              <Link href="/blog">
                <Button>Explore Latest Posts</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredBookmarks.map(bookmark => (
            <Card 
              key={bookmark.id} 
              className={`hover:shadow-md transition-shadow ${
                selectedItems.has(bookmark.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Selection checkbox */}
                  {isSelecting && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={() => toggleItemSelection(bookmark.id)}
                    >
                      {selectedItems.has(bookmark.id) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Title and link */}
                    <h3 className="font-medium line-clamp-2 mb-2">
                      <a 
                        href={bookmark.link} 
                        className="hover:text-primary transition-colors"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {bookmark.title || `Post #${bookmark.id}`}
                      </a>
                    </h3>

                    {/* Excerpt */}
                    {bookmark.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {bookmark.excerpt}
                      </p>
                    )}

                    {/* Metadata */}
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

                    {/* Tags */}
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {bookmark.tags.slice(0, 3).map(tag => (
                          <Badge key={tag.slug} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {bookmark.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{bookmark.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(bookmark.id)}
                      aria-label="Remove bookmark"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        Bookmarks are private and stored to your account.
      </div>
    </div>
  );
}
