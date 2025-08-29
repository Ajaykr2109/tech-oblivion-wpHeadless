import React from 'react'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/wp'
import { logWPError } from '@/lib/log'

type Props = { params: { slug: string } }

export default async function PostPage({ params }: Props) {
  let post: any = null
  try {
    post = await getPostBySlug(params.slug)
  } catch (err: any) {
    logWPError('post-page-getPost', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    // If upstream is down, treat as not found to avoid build failure
    return notFound()
  }

  if (!post) return notFound()

  return (
    <main>
      <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
      {post.featuredImage && <img src={post.featuredImage} alt="" style={{ maxWidth: 800 }} />}
      <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </main>
  )
}
