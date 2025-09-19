import React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPostBySlug, PostDetail } from '@/lib/wp'
import { logWPError } from '@/lib/log'

type Props = { params: Promise<{ slug: string }> }

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  let post: PostDetail | null = null
  try {
    post = await getPostBySlug(slug)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status : undefined
    logWPError('post-page-getPost', { status, statusText: msg, body: typeof err === 'string' ? err : JSON.stringify(err) })
    // If upstream is down, treat as not found to avoid build failure
    return notFound()
  }

  if (!post) return notFound()

  return (
    <main>
      <h1 dangerouslySetInnerHTML={{ __html: post.title }} />
      {post.featuredImage && (
        <div style={{ maxWidth: 800 }}>
          <Image src={post.featuredImage} alt="" width={800} height={450} style={{ objectFit: 'cover' }} />
        </div>
      )}
      <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </main>
  )
}
