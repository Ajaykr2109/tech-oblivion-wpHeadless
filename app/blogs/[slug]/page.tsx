import React from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPostBySlug, PostDetail } from '@/lib/wp'
import { logWPError } from '@/lib/log'

type Props = { params: { slug: string } }

export default async function PostPage({ params }: Props) {
  let post: PostDetail | null = null
  try {
    post = await getPostBySlug(params.slug)
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err)
    logWPError('post-page-getPost', { status: (err as any)?.status, statusText: msg, body: typeof err === 'string' ? err : JSON.stringify(err) })
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
