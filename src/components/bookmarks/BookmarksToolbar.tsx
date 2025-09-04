import { Search, Grid, List, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';
type ViewMode = 'grid' | 'list';

interface BookmarksToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedAuthor: string;
  onAuthorChange: (author: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  allAuthors: string[];
  allTypes: string[];
  isSelecting: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelection: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveSelected: () => void;
  onCancelSelection: () => void;
}

export function BookmarksToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedAuthor,
  onAuthorChange,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  allAuthors,
  allTypes,
  isSelecting,
  selectedCount,
  totalCount,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onRemoveSelected,
  onCancelSelection,
}: BookmarksToolbarProps) {
  return (
    <div className="sticky top-20 z-10 bg-background/95 backdrop-blur border rounded-lg p-4 mb-6">
      {/* Top row: Search, Sort, Filters, View Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
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
          <Select value={selectedAuthor} onValueChange={onAuthorChange}>
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
          <Select value={selectedType} onValueChange={onTypeChange}>
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

      {/* Bottom row: Actions and View Mode */}
      <div className="flex items-center justify-between">
        {/* Bulk selection controls */}
        <div className="flex items-center gap-2">
          {!isSelecting ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSelection}
              disabled={totalCount === 0}
            >
              Select Multiple
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={onDeselectAll}>
                Deselect All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemoveSelected}
                disabled={selectedCount === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove ({selectedCount})
              </Button>
              <Button variant="outline" size="sm" onClick={onCancelSelection}>
                Cancel
              </Button>
            </>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {(searchQuery || selectedAuthor || selectedType) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
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
  );
}
