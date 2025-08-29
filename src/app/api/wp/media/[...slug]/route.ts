import type { NextRequest } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, {
  params,
}: { params: { slug?: string[]; path?: string[] } }) {
  const segs = (params?.slug ?? params?.path ?? []) as string[];
  if (!Array.isArray(segs) || segs.length === 0) {
    return new Response('Bad path', { status: 400 });
  }

  const origin = `https://techoblivion.in/${segs.join('/')}`;

  const upstream = await fetch(origin, { cache: 'no-store' });
  if (!upstream.ok) return new Response('Not found', { status: upstream.status });

  const ct = upstream.headers.get('content-type') || 'application/octet-stream';
  const ab = await upstream.arrayBuffer();
  return new Response(ab, {
    headers: {
      'Content-Type': ct,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
