import React from 'react'
import Link from 'next/link'
import { getPosts, PostSummary } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'

export const dynamic = 'force-static'

export default async function BlogIndexPage() {
  let posts: PostSummary[] = []
  try {
    const res = await getPosts({ page: 1, perPage: 9 })
    posts = res.items || []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Blog fetch failed during prerender:', err)
    posts = []
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Articles</h1>
      {posts.length === 0 ? (
        <div>No posts available.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block border rounded-lg p-4 hover:shadow">
              <h2 className="font-semibold mb-2" dangerouslySetInnerHTML={{ __html: sanitizeWP(post.title) }} />
              <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: post.excerptHtml || '' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
