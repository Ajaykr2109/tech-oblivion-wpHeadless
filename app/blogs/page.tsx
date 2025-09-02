import React from 'react'
import Image from 'next/image'

import { getPosts, PostSummary } from '@/lib/wp'
import { logWPError } from '@/lib/log'

export default async function BlogsPage() {
  let items: PostSummary[] = []
  try {
    const res = await getPosts({ page: 1, perPage: 10 })
    items = res.items
  } catch (err: unknown) {
    // Log upstream WP error and continue with empty list so build/prerender succeeds
    const status = (err && typeof err === 'object' && 'status' in err) ? (err as { status?: number }).status : undefined
    const statusText = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : String(err)
    logWPError('blogs-page-getPosts', { status, statusText, body: typeof err === 'string' ? err : JSON.stringify(err) })
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
              {p.featuredImage && (
                <div style={{ maxWidth: 240 }}>
                  <Image src={p.featuredImage} alt="" width={240} height={140} style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: p.excerptHtml ?? '' }} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
