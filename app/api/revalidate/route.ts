import { revalidateTag } from 'next/cache'
// import { NextResponse } from 'next/server' // Unused import

export async function POST(req: Request) {
  let body: unknown = {}
  try { body = await req.json() } catch (_e: unknown) { /* ignore */ }
  const url = new URL(req.url)
  const b = body as Record<string, any>
  const secret = url.searchParams.get('secret') || b?.secret
  if (secret !== process.env.NEXT_REVALIDATE_SECRET) return new Response('Forbidden', { status: 403 })

  const { slug, page, taxonomy, all } = b || {}
  const revalidated: string[] = []

  try {
    // Prefer tag-based revalidation if available
    if (typeof revalidateTag === 'function') {
      if (all) {
        // broad sweep
        revalidateTag('wp:posts')
        revalidated.push('/')
        revalidated.push('/blogs')
      }
      // always refresh list on demand
      revalidateTag('wp:posts')
      revalidated.push('/')
      if (slug) {
        revalidateTag(`wp:post:${slug}`)
        revalidated.push(`/blogs/${slug}`)
      }
      if (page) {
        revalidateTag(`wp:page:${page}`)
        revalidated.push(`/pages/${page}`)
      }
      if (taxonomy) {
        // optional future taxonomy tagging, kept for parity
        revalidateTag(`wp:tax:${taxonomy}`)
      }
      return new Response(JSON.stringify({ revalidated, now: Date.now() }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Fallback: return the list for an external revalidator to act on
    revalidated.push('/')
    revalidated.push('/blogs')
    if (slug) revalidated.push(`/blogs/${slug}`)
  return new Response(JSON.stringify({ revalidated, now: Date.now() }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: unknown) {
    const msg = (e && typeof e === 'object' && 'message' in e) ? (e as any).message : String(e)
  return new Response(JSON.stringify({ message: msg || 'fail', error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
