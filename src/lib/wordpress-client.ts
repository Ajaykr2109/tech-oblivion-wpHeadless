// Direct WordPress REST API client (temporary - bypasses proxy)
// This makes direct calls from browser to WordPress

const WP_BASE_URL = 'https://techoblivion.in';
const WP_API_BASE = `${WP_BASE_URL}/wp-json/wp/v2`;

export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: Record<string, {
      source_url: string;
      width: number;
      height: number;
    }>;
  };
}

export class WordPressClient {
  private baseUrl: string;

  constructor(baseUrl: string = WP_API_BASE) {
    this.baseUrl = baseUrl;
  }

  // Get posts with embedded media and terms
  async getPosts(params?: {
    page?: number;
    per_page?: number;
    categories?: number[];
    tags?: number[];
    search?: string;
  }): Promise<{ posts: WordPressPost[]; totalPages: number; total: number }> {
    const searchParams = new URLSearchParams();
    
    // Add embed parameter to include featured media and terms
    searchParams.set('_embed', '1');
    
    if (params?.page) {
      searchParams.set('page', params.page.toString());
    }
    
    if (params?.per_page) {
      searchParams.set('per_page', params.per_page.toString());
    }
    
    if (params?.categories?.length) {
      searchParams.set('categories', params.categories.join(','));
    }
    
    if (params?.tags?.length) {
      searchParams.set('tags', params.tags.join(','));
    }
    
    if (params?.search) {
      searchParams.set('search', params.search);
    }

    const url = `${this.baseUrl}/posts?${searchParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      const posts: WordPressPost[] = await response.json();
      
      // Get pagination info from headers
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      const total = parseInt(response.headers.get('X-WP-Total') || '0');
      
      return { posts, totalPages, total };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  // Get a single post by ID
  async getPost(id: number): Promise<WordPressPost> {
    const url = `${this.baseUrl}/posts/${id}?_embed=1`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  // Get a single post by slug
  async getPostBySlug(slug: string): Promise<WordPressPost | null> {
    const url = `${this.baseUrl}/posts?slug=${slug}&_embed=1`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      const posts: WordPressPost[] = await response.json();
      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      throw error;
    }
  }

  // Get media by ID
  async getMedia(id: number): Promise<WordPressMedia> {
    const url = `${this.baseUrl}/media/${id}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  }

  // Get categories
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
    const url = `${this.baseUrl}/categories`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get tags
  async getTags(): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
    const url = `${this.baseUrl}/tags`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }
}

// Export a default instance
export const wordpressClient = new WordPressClient();

// Helper functions for easier usage
export const getPosts = (params?: Parameters<WordPressClient['getPosts']>[0]) => 
  wordpressClient.getPosts(params);

export const getPost = (id: number) => 
  wordpressClient.getPost(id);

export const getPostBySlug = (slug: string) => 
  wordpressClient.getPostBySlug(slug);

export const getMedia = (id: number) => 
  wordpressClient.getMedia(id);

export const getCategories = () => 
  wordpressClient.getCategories();

export const getTags = () => 
  wordpressClient.getTags();
