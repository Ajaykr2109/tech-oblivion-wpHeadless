'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/lib/fetcher'; // Assuming you have a fetcher utility
import { apiFetch } from '@/lib/fetcher';
export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      // Fetch search results from the WordPress API
      fetcher(`/api/wp/posts?search=${searchQuery}`)
        .then(data => { setResults(data); })
        .catch(error => console.error('Error fetching search results:', error));
    }
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {searchQuery ? (
        <p>You searched for: {searchQuery}</p>
      ) : (
        <p>Please enter a search query.</p>
      )}
      
      <div className="mt-8">
        {results.length > 0 ? (
          <ul>
            {results.map((result: any) => (
              <li key={result.id} className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold mb-2"><Link href={`/blog/${result.slug}`}>{result.title.rendered}</Link></h2>
                <div dangerouslySetInnerHTML={{ __html: result.excerpt.rendered }} />
              </li>
            ))}
          </ul>
        ) : searchQuery && <p>No results found for "{searchQuery}".</p>}
      </div>

    </div>
  );
}