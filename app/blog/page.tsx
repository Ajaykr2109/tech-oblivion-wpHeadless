import React from 'react'
import { getPosts } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'

export default async function BlogPage() {
  let posts: any[] = []
  try {
    posts = await getPosts(10)
  } catch (err) {
    // During build/prerender WP may be unavailable; fall back to empty list so build can succeed.
    // Log to server console for diagnostics.
    // eslint-disable-next-line no-console
    console.error('Blog fetch failed during prerender:', err)
    posts = []
  }

  return (
    <section className="prose mx-auto py-10">
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <div>No posts available.</div>
      ) : (
        <ul>
          {posts.map((p: any) => (
            <li key={p.id}>
              <a href={`/blog/${p.slug}`} dangerouslySetInnerHTML={{ __html: sanitizeWP(p.title.rendered) }} /> <small>{p.date}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
