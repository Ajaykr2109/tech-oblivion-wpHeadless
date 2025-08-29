import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let body: unknown = {}
  try { body = await req.json() } catch (_e: unknown) { /* ignore */ }
  const url = new URL(req.url)
  const b = body as Record<string, any>
  const secret = url.searchParams.get('secret') || b?.secret
  if (secret !== process.env.NEXT_REVALIDATE_SECRET) return new Response('Forbidden', { status: 403 })

  const { slug, all } = b || {}
  const revalidated: string[] = []

  try {
    // Prefer tag-based revalidation if available
    if (typeof revalidateTag === 'function') {
      if (all) {
        revalidateTag('wp:posts')
        revalidated.push('/blogs')
      }
      revalidateTag('wp:posts')
      revalidated.push('/')
      if (slug) {
        revalidateTag(`wp:post:${slug}`)
        revalidated.push(`/blogs/${slug}`)
      }
      return NextResponse.json({ revalidated, now: Date.now() }, { status: 200 })
    }

    // Fallback: return the list for an external revalidator to act on
    revalidated.push('/')
    revalidated.push('/blogs')
    if (slug) revalidated.push(`/blogs/${slug}`)
    return NextResponse.json({ revalidated, now: Date.now() }, { status: 200 })
  } catch (e: unknown) {
    const msg = (e && typeof e === 'object' && 'message' in e) ? (e as any).message : String(e)
    return NextResponse.json({ message: msg || 'fail' }, { status: 500 })
  }
}
