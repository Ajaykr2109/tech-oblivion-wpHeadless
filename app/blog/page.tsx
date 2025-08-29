import React from 'react'
import { getPosts, PostSummary } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'

export default async function BlogPage() {
  let posts: PostSummary[] = []
  try {
    const res = await getPosts()
    posts = res.items || []
  } catch (err: unknown) {
    // During build/prerender WP may be unavailable; fall back to empty list so build can succeed.
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
          {posts.map((p) => (
            <li key={p.id}>
              <a href={`/blog/${p.slug}`} dangerouslySetInnerHTML={{ __html: sanitizeWP(p.title) }} /> <small>{p.date}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
