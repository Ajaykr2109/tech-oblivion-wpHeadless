import React from 'react'
import { Metadata } from 'next'
import { getPostBySlug } from '@/lib/wp'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)
    if (!post) return { title: slug }
    return {
      title: post.title || slug,
      description: post.contentHtml ? post.contentHtml.replace(/<[^>]+>/g, '').slice(0, 160) : undefined,
      openGraph: post.featuredImage ? { images: [post.featuredImage] } : undefined,
    }
  } catch (err: any) {
    console.error('generateMetadata error:', err)
    const { slug } = await params
    return { title: slug }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) { 
  let post: any = null

  try {
    const { slug } = await params
    post = await getPostBySlug(slug)
  } catch (err: any) {
    console.error('Error fetching post:', err)
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.featuredImage && (
            <div className="relative w-full max-w-2xl mx-auto mb-6">
              <Image
                src={post.featuredImage.replace('/api/wp/media/', 'https://techoblivion.in/')}
                alt={post.title}
                width={800}
                height={400}
                className="rounded-lg object-cover w-full"
                priority
              />
            </div>
          )}
          <p className="text-muted-foreground mt-4">
            Published on {new Date(post.date).toLocaleDateString()}
          </p>
        </header>
        
        <div 
          className="max-w-none [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-4 [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4"
          dangerouslySetInnerHTML={{ 
            __html: post.contentHtml
              ?.replace(/src="\/api\/wp\/media\//g, 'src="https://techoblivion.in/')
              ?.replace(/src="\/wp-content\//g, 'src="https://techoblivion.in/wp-content/') || '' 
          }}
        />
      </article>
    </div>
  )
}
