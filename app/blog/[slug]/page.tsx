import React from 'react'
import { Metadata } from 'next'
import { getPostBySlug } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  const y = post?.yoast_head_json ?? {}
  return {
    title: y.title || y.og_title || post?.slug,
    description: y.description || y.og_description || undefined,
    openGraph: y.og_title ? { title: y.og_title, description: y.og_description, images: y.og_image?.map((i: any) => i.url) ?? [] } : undefined,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return <div className="prose mx-auto py-10">Post not found.</div>
  return (
    <article className="prose mx-auto py-10">
      <h1 dangerouslySetInnerHTML={{ __html: sanitizeWP(post.title.rendered) }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizeWP(post.content.rendered) }} />
    </article>
  )
}
