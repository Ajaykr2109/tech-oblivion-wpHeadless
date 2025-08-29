import React from 'react'
import { getPosts } from '@/lib/wp'
import { logWPError } from '@/lib/log'

export default async function BlogsPage() {
  let items: any[] = []
  try {
    const res = await getPosts({ page: 1, perPage: 10 })
    items = res.items
  } catch (err: any) {
    // Log upstream WP error and continue with empty list so build/prerender succeeds
    logWPError('blogs-page-getPosts', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    items = []
  }

  return (
    <main>
      <h1>Blogs</h1>
      {items.length === 0 ? (
        <div>No posts available.</div>
      ) : (
        <ul>
          {items.map(p => (
            <li key={p.id}>
              <a href={`/blogs/${p.slug}`} dangerouslySetInnerHTML={{ __html: p.title }} />
              {p.featuredImage && <img src={p.featuredImage} alt="" style={{ maxWidth: 240 }} />}
              <div dangerouslySetInnerHTML={{ __html: p.excerptHtml }} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
