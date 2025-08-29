import React from 'react'
import { Metadata } from 'next'
import { getPostBySlug, getCommentsForPost, getCategoriesForPost, getTagsForPost } from '@/lib/wp'
import { sanitizeWP } from '@/lib/sanitize'
import { logWPError } from '@/lib/log'
import { notFound } from 'next/navigation'
import Comment from '@/src/components/Comment'
import Category from '@/src/components/Category'
import Tag from '@/src/components/Tag'

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
  let comments: any[] = []
  let categories: any[] = []
  let tags: any[] = []

  try {
    post = await getPostBySlug(params.slug)
  } catch (err: any) {
    logWPError('post-page-getPost', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    return notFound()
  }
  
  if (post) {
    try {
      comments = await getCommentsForPost(post.id)
    } catch (err: any) {
      logWPError('post-page-getComments', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    }

    try {
      categories = await getCategoriesForPost(post.categories)
    } catch (err: any) {
      logWPError('post-page-getCategories', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    }

    try {
      tags = await getTagsForPost(post.tags)
    } catch (err: any) {
      logWPError('post-page-getTags', { status: err?.status, statusText: err?.message, body: typeof err === 'string' ? err : JSON.stringify(err) })
    }
  }
  
  if (!post) return notFound()

  return (
    <article className="prose mx-auto py-10">
      <h1 dangerouslySetInnerHTML={{ __html: sanitizeWP(post.title) }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizeWP(post.contentHtml) }} />

      {categories.length > 0 && (
        <div>
          <h2>Categories</h2>
          <ul>
            {categories.map(category => <li key={category.id}><Category category={category} /></li>)}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h2>Tags</h2>
          <ul>
            {tags.map(tag => <li key={tag.id}><Tag tag={tag} /></li>)}
          </ul>
        </div>
      )}

      {comments.length > 0 && (
        <div>
          <h2>Comments</h2>
          {comments.map(comment => <Comment key={comment.id} comment={comment} />)}
        </div>
      )}
    </article>
  )
}
