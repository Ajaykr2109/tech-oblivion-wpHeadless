import React from 'react'

const WP = process.env.WP_URL

export default async function BlogPage() {
  const posts = await fetch(`${WP}/wp-json/wp/v2/posts?per_page=10&_fields=id,slug,title,excerpt,date`).then(r => r.json())
  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {posts.map((p: any) => (
          <li key={p.id}><a href={`/blog/${p.slug}`} >{p.title.rendered || p.title}</a> <small>{p.date}</small></li>
        ))}
      </ul>
    </main>
  )
}
