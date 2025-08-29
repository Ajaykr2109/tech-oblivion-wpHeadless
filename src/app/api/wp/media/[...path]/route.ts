import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const origin = `https://techoblivion.in/${path}`;

  const res = await fetch(origin, { cache: 'no-store' });
  if (!res.ok) return new Response('Not found', { status: res.status });

  const ct = res.headers.get('content-type') || 'application/octet-stream';
  const ab = await res.arrayBuffer();
  
  return new Response(ab, {
    headers: {
      'Content-Type': ct,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}