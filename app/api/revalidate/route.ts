import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  let body: any = {}
  try { body = await req.json() } catch (e) { /* ignore */ }
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret') || body?.secret
  if (secret !== process.env.NEXT_REVALIDATE_SECRET) return new Response('Forbidden', { status: 403 })

  const { slug, all } = body || {}
  if (all) revalidateTag('wp:posts')
  if (slug) revalidateTag(`wp:post:${slug}`)
  return new Response('OK', { status: 200 })
}
