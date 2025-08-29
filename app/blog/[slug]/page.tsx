import React from 'react'
import { Metadata } from 'next'
import sanitizeHtml from 'sanitize-html'

const WP = process.env.WP_URL

function sanitize(html: string) {
  const baseAllowedTags = ['a','b','i','strong','em','p','ul','ol','li','br','blockquote','code','pre']
  const baseAllowedAttributes: Record<string,string[]> = {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  }
  return sanitizeHtml(html, {
    allowedTags: baseAllowedTags.concat(['img', 'h1', 'h2', 'iframe']),
    allowedAttributes: {
      ...baseAllowedAttributes,
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    },
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    transformTags: {
      'a': function(tagName: any, attribs: any) {
        // ensure links open safely
        const href = attribs.href || ''
        const rel = href.startsWith('http') ? 'noopener noreferrer' : attribs.rel
        return { tagName: 'a', attribs: { ...attribs, rel, target: '_blank' } }
      }
    }
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug
  const res = await fetch(`${WP}/wp-json/wp/v2/posts?slug=${slug}&_fields=yoast_head_json`).then(r => r.json())
  const post = Array.isArray(res) ? res[0] : res
  if (post?.yoast_head_json) {
    const yoast = post.yoast_head_json
    return { title: yoast.title || undefined, description: yoast.description || undefined }
  }
  return { title: undefined }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const res = await fetch(`${WP}/wp-json/wp/v2/posts?slug=${slug}&_fields=title,content,yoast_head_json`).then(r => r.json())
  const post = Array.isArray(res) ? res[0] : res
  if (!post) return <main><h1>Not found</h1></main>
  return (
    <main>
      <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered || post.title }} />
      <article dangerouslySetInnerHTML={{ __html: sanitize(post.content.rendered || post.content) }} />
    </main>
  )
}
