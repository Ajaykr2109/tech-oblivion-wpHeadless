import { notFound } from 'next/navigation'

import PostEditorPageClient from '@/components/admin/PostEditorPageClient'

export const runtime = 'nodejs'

async function fetchPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/wp/posts?id=${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const p = await res.json()
  return p
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) notFound()
  // Role gate via Roles Matrix API (single source of truth)
  const rmRes = await fetch('/api/roles/matrix', { cache: 'no-store' })
  if (!rmRes.ok) notFound()
  const matrix = await rmRes.json()
  if (!matrix?.can?.posts?.edit) notFound()
  const post = await fetchPost(id)
  if (!post) notFound()
  const title = typeof post?.title === 'string' ? post.title : post?.title?.rendered || ''
  const content = typeof post?.content === 'string' ? post.content : post?.content?.rendered || ''
  const excerpt = typeof post?.excerpt === 'string' ? post.excerpt : post?.excerpt?.rendered || ''
  const status = post?.status || 'draft'
  return (
    <PostEditorPageClient postId={Number(id)} initial={{ title, content, excerpt, status }} />
  )
}
