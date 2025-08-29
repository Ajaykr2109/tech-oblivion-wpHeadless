import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const incoming = new URL(req.url);
  const out = new URL('https://techoblivion.in/wp-json/wp/v2/posts');

  // pass through supported params
  incoming.searchParams.forEach((v, k) => out.searchParams.set(k, v));

  // normalize camelCase -> WP expected names
  if (incoming.searchParams.has('perPage')) {
    out.searchParams.set('per_page', incoming.searchParams.get('perPage')!);
  }
  // keep ?page as-is (WP REST uses `page` for pagination)
  // ensure useful defaults
  if (!out.searchParams.has('_embed')) out.searchParams.set('_embed', '1');
  if (!out.searchParams.has('per_page')) out.searchParams.set('per_page', '10');

  const res = await fetch(out, { cache: 'no-store' });
  if (!res.ok) return new Response('Upstream error', { status: res.status });

  return Response.json(await res.json(), {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
