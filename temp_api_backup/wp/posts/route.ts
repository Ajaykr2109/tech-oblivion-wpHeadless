export const runtime = 'nodejs';        // we need Node for crypto/env
export const dynamic = 'force-dynamic'; // no caching in dev
import { NextRequest } from 'next/server';
import { signProxy } from '@/lib/wpProxy';

const WP_ORIGIN = process.env.WP_ORIGIN ?? 'https://techoblivion.in';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = Number(searchParams.get('perPage') ?? '10');

  const path = 'wp/v2/posts';
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    _embed: '1',
    status: 'publish',
  });

  const { ts, sig } = await signProxy('GET', path, null);

  const res = await fetch(`${WP_ORIGIN}/wp-json/fe-auth/v1/proxy?path=${encodeURIComponent(path)}&${query.toString()}`, {
    method: 'GET',
    headers: {
      'x-fe-ts': ts,
      'x-fe-sign': sig,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
