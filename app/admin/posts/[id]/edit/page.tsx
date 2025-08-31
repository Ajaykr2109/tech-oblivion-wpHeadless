import { notFound } from 'next/navigation'
import PostEditorPageClient from '@/components/admin/PostEditorPageClient'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'

async function fetchPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/wp/posts?id=${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const p = await res.json()
  return p
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const { id } = params
  if (!id) notFound()
  // Role gate: only users with editing perms
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 }) as any
  try {
    const claims: any = await verifySession(sessionCookie.value)
    const roles: string[] = (claims?.roles as any) || []
    const canEdit = roles.some(r => ['author','editor','administrator'].includes(r))
    if (!canEdit) return new Response('Forbidden', { status: 403 }) as any
  } catch {
    return new Response('Unauthorized', { status: 401 }) as any
  }
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
