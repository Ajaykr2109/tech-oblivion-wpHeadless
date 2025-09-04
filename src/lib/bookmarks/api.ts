/**
 * API helpers for bookmark operations
 */

export interface Bookmark {
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
}

export interface BookmarkFilters {
  search?: string;
  author?: string;
  tag?: string;
  category?: string;
  type?: 'post' | 'page';
  sort?: 'recent' | 'oldest' | 'title-asc' | 'title-desc';
  page?: number;
  perPage?: number;
}

export interface BookmarkResponse {
  items: Bookmark[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BookmarkStats {
  byTag: Record<string, number>;
  byAuthor: Record<string, number>;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  total: number;
}

/**
 * Fetch user's bookmarks with optional filters
 */
export async function fetchBookmarks(filters: BookmarkFilters = {}): Promise<BookmarkResponse> {
  const params = new URLSearchParams();
  params.set('expand', '1'); // Get full bookmark data

  if (filters.search) params.set('search', filters.search);
  if (filters.author) params.set('author', filters.author);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.category) params.set('category', filters.category);
  if (filters.type) params.set('type', filters.type);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.perPage) params.set('per_page', filters.perPage.toString());

  const response = await fetch(`/api/wp/bookmarks?${params.toString()}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Transform the data to match our expected format
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: data?.total || data?.items?.length || 0,
    page: filters.page || 1,
    perPage: filters.perPage || 20,
    totalPages: Math.ceil((data?.total || data?.items?.length || 0) / (filters.perPage || 20))
  };
}

/**
 * Remove a single bookmark
 */
export async function removeBookmark(id: number): Promise<void> {
  const response = await fetch(`/api/wp/bookmarks`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });

  if (!response.ok) {
    throw new Error(`Failed to remove bookmark: ${response.status} ${response.statusText}`);
  }
}

/**
 * Remove multiple bookmarks in bulk
 */
export async function removeBookmarksBulk(ids: number[]): Promise<void> {
  const response = await fetch(`/api/wp/bookmarks/bulk`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids })
  });

  if (!response.ok) {
    throw new Error(`Failed to remove bookmarks: ${response.status} ${response.statusText}`);
  }
}

/**
 * Add a bookmark
 */
export async function addBookmark(postId: number): Promise<{ bookmarked: boolean; count: number }> {
  const response = await fetch(`/api/wp/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postId })
  });

  if (!response.ok) {
    throw new Error(`Failed to add bookmark: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if a post is bookmarked
 */
export async function checkBookmark(postId: number): Promise<{ bookmarked: boolean; count: number }> {
  const response = await fetch(`/api/wp/bookmarks?postId=${encodeURIComponent(postId)}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to check bookmark: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get bookmark statistics for filtering
 */
export async function fetchBookmarkStats(): Promise<BookmarkStats> {
  const response = await fetch(`/api/wp/bookmarks/stats`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmark stats: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
