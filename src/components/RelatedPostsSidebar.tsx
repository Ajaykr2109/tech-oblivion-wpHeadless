"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/fetcher'; // Adjust the import path as necessary

interface Term {
  id: number;
  name: string;
  slug: string;
}

interface RelatedPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
}

interface RelatedPostsSidebarProps {
  currentPostCategories: Term[];
  currentPostTags: Term[];
  currentPostId: number;
}

const RelatedPostsSidebar: React.FC<RelatedPostsSidebarProps> = ({
  currentPostCategories,
  currentPostTags,
  currentPostId,
}) => {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query parameters based on categories and tags
        const categoryIds = currentPostCategories.map((cat) => cat.id).join(',');
        const tagIds = currentPostTags.map((tag) => tag.id).join(',');

        let url = 'https://techoblivion.in/wp-json/wp/v2/posts?_embed';
        const params = new URLSearchParams();

        if (categoryIds) {
          params.append('categories', categoryIds);
        }
        if (tagIds) {
          params.append('tags', tagIds);
        }

        // Exclude the current post
        params.append('exclude', currentPostId.toString());

        // Limit the number of related posts
        params.append('per_page', '5'); // Fetch up to 5 related posts

        url = `${url}&${params.toString()}`;

  const data = await apiFetch<RelatedPost[]>(url);

        // Filter out the current post just in case
        const filteredData = data.filter((post: RelatedPost) => post.id !== currentPostId);

        setRelatedPosts(filteredData);
      } catch (err: any) {
        console.error('Error fetching related posts:', err);
        setError('Failed to load related posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostCategories, currentPostTags, currentPostId]);

  if (loading) {
    return <div>Loading related posts...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (relatedPosts.length === 0) {
    return null; // Don't display the sidebar if no related posts are found
  }

  return (
    <div className="w-full lg:w-64 lg:sticky lg:top-20 lg:self-start mt-8 lg:mt-0">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Related Posts</h3>
      <ul>
        {relatedPosts.map((post) => (
          <li key={post.id} className="mb-3 last:mb-0">
            <Link href={`/blog/${post.slug}`} className="text-gray-800 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400 transition-colors duration-200">
              {post.title.rendered}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedPostsSidebar;