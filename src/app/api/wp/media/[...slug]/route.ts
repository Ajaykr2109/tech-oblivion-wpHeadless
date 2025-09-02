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

  const WP = (process.env.WP_URL || 'http://example.com').replace(/\/+$/, '');
  let origin = `${WP}/${segs.join('/')}`;
  // Support absolute fetches: /api/wp/media/absolute/<encodeURIComponent(full_url)>
  if (segs[0] === 'absolute') {
    const encoded = segs.slice(1).join('/');
    try {
      const full = decodeURIComponent(encoded);
      const u = new URL(full);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        origin = full;
      }
    } catch {
      // fallthrough; will attempt default WP-based origin which may 404
    }
  }

  // Use browser-like headers to avoid hotlink protection and misclassification.
  const headers: Record<string, string> = {
    Accept: 'image/*,*/*;q=0.8',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Referer: 'http://example.com/',
  };

  let upstream: Response;
  try {
    upstream = await fetch(origin, { cache: 'no-store', headers });
  } catch (err: unknown) {
    console.error('[media-proxy] fetch error', { origin, err: err instanceof Error ? err.message : String(err) });
    return placeholderResponse('upstream-fetch-error');
  }

  if (!upstream.ok) {
    console.warn('[media-proxy] upstream not ok', { origin, status: upstream.status });
    return upstream.status === 404
      ? new Response('Not found', { status: 404 })
      : placeholderResponse(`upstream-status-${upstream.status}`);
  }

  const ct = upstream.headers.get('content-type')?.toLowerCase() ?? '';
  const ab = await upstream.arrayBuffer();

  // Some hosts return HTML (403/maintenance pages) with content-type text/html. Guard that.
  const isImage = ct.startsWith('image/');
  if (!isImage) {
    // Try to sniff the first few bytes to see if it's HTML regardless of content-type.
    const head = new Uint8Array(ab.slice(0, 64));
    const asText = safeDecode(head);
    const seemsHtml = /<(!doctype\s+html|html|body)[^>]*>/i.test(asText);
    console.warn('[media-proxy] non-image upstream', { origin, ct, seemsHtml });
    // Serve a tiny transparent PNG placeholder to avoid browser errors, with a short cache.
    return placeholderResponse('bad-content-type', {
      'X-Upstream-Content-Type': ct || 'unknown',
    });
  }

  return new Response(ab, {
    headers: {
      'Content-Type': ct || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

// Return a 1x1 transparent PNG with short cache, including a diagnostic header.
function placeholderResponse(reason: string, extraHeaders?: Record<string, string>) {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBA6m+Vb8AAAAASUVORK5CYII=';
  const body = Buffer.from(pngBase64, 'base64');
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300',
      'X-Proxy-Status': reason,
      ...(extraHeaders ?? {}),
    },
  });
}

function safeDecode(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return '';
  }
}
