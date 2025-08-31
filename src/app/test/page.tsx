'use client'

import { useEffect, useState } from 'react'

import type { WordPressPost } from '@/lib/wordpress-client'

export default function TestPage() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/wp/posts?per_page=3&_embed=1')
        if (!res.ok) throw new Error(`Failed: ${res.status}`)
        const items: WordPressPost[] = await res.json()
        setPosts(items)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">WordPress Direct Connection Test</h1>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">WordPress Direct Connection Test</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">WordPress Direct Connection Test</h1>
      <p className="mb-4 text-green-600">✅ Successfully connected to WordPress!</p>
      
      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              {post.title.rendered}
            </h2>
            <p className="text-gray-600 mb-2">
              Posted: {new Date(post.date).toLocaleDateString()}
            </p>
            <div className="text-sm text-gray-500">
              {post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 200)}...
            </div>
            {post._embedded?.['wp:featuredmedia']?.[0] && (
              <div className="mt-2">
                <img 
                  src={post._embedded['wp:featuredmedia'][0].source_url}
                  alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
