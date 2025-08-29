import React from 'react'
import { Metadata } from 'next'
import { getPostBySlug } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'
import { logWPError } from '@/lib/log'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug)
    if (!post) return { title: params.slug }
    return {
      title: post.title || params.slug,
      description: post.contentHtml ? (post.contentHtml.replace(/<[^>]+>/g, '').slice(0, 160)) : undefined,
      openGraph: post.featuredImage ? { images: [post.featuredImage] } : undefined,
    }
  } catch (err: any) {
    logWPError('generateMetadata-getPostBySlug', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    return { title: params.slug }
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  let post: any = null
  try {
    post = await getPostBySlug(params.slug)
  } catch (err: any) {
    logWPError('post-page-getPost', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    return notFound()
  }

  if (!post) return notFound()

  return (
    <article className="prose mx-auto py-10">
      <h1 dangerouslySetInnerHTML={{ __html: sanitizeWP(post.title) }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizeWP(post.contentHtml) }} />
    </article>
  )
}
