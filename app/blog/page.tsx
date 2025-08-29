import React from 'react'
import { getPosts } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'

export default async function BlogPage() {
  const posts = await getPosts(10)
  return (
    <section className="prose mx-auto py-10">
      <h1>Blog</h1>
      <ul>
        {posts.map((p: any) => (
          <li key={p.id}>
            <a href={`/blog/${p.slug}`} dangerouslySetInnerHTML={{ __html: sanitizeWP(p.title.rendered) }} /> <small>{p.date}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}
