# WP endpoint performance and consistency plan

Summary

- Keep profile page on single fe-auth public-user endpoint (aggregates posts + comments).
- Remap authors list to core wp/v2/users with include and _fields to trim payload.
- Add HTTP caching headers and optional compact=1 to public-user for lighter responses.
- Add small optional revalidate for Next.js profile API.
- Ensure consistent social object across all endpoints.

Section 1 — Next.js authors list via wp/v2/users with _fields

```typescript
// filepath: e:\VSCode_Repo\tech-oblivion-wpHeadless\app\api\wp\users\route.ts
// Minimal authors list API backed by wp/v2/users?include=... for performance
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LiteUser = {
  id: number
  slug: string
  name?: string
  description?: string
  avatar_urls?: Record<string, string>
  social?: { twitter: string | null; linkedin: string | null; github: string | null }
}

function normalizeUrl(u?: string | null): string | null {
  if (!u) return null
  const s = String(u).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

function deriveSocial(u: any): { twitter: string | null; linkedin: string | null; github: string | null } {
  if (u && typeof u.social === 'object' && u.social) {
    return {
      twitter: normalizeUrl((u.social as any).twitter ?? null),
      linkedin: normalizeUrl((u.social as any).linkedin ?? null),
      github: normalizeUrl((u.social as any).github ?? null),
    }
  }
  const pf = (u && typeof u.profile_fields === 'object') ? (u.profile_fields as Record<string, unknown>) : null
  const get = (k: string) => (pf && typeof pf[k] === 'string') ? (pf[k] as string) : undefined
  const tw = (u?.twitter_url as string) || get('twitter_url') || get('twitter') || get('x')
  const ln = (u?.linkedin_url as string) || get('linkedin_url') || get('linkedin')
  const gh = (u?.github_url as string) || get('github_url') || get('github')
  return { twitter: normalizeUrl(tw || null), linkedin: normalizeUrl(ln || null), github: normalizeUrl(gh || null) }
}

function sanitize(u: any): LiteUser {
  return {
    id: Number(u?.id ?? 0),
    slug: String(u?.slug ?? u?.user_nicename ?? ''),
    name: u?.name ?? u?.display_name ?? '',
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    social: deriveSocial(u),
  }
}

function chunk<T>(arr: T[], size = 100): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function GET(req: Request) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const url = new URL(req.url)
  const includeParam = url.searchParams.get('include') || ''
  const ids = includeParam
    .split(',')
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n) && n > 0)

  if (ids.length === 0) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  const base = WP.replace(/\/$/, '')
  const perPage = 100
  const idChunks = chunk(ids, perPage)

  const results: any[] = []
  await Promise.all(idChunks.map(async (group) => {
    const u = new URL('/wp-json/wp/v2/users', base)
    group.forEach(id => u.searchParams.append('include[]', String(id)))
    u.searchParams.set('per_page', String(perPage))
    u.searchParams.set('context', 'view')
    u.searchParams.set('_fields', 'id,slug,name,description,avatar_urls,social')
    const res = await fetch(u.toString(), { cache: 'no-store' })
    if (res.ok) {
      const arr = await res.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
      results.push(...arr)
    }
  }))

  const map = new Map<number, any>(results.map((u: any) => [Number(u.id), u]))
  const ordered = ids.map(id => map.get(id)).filter(Boolean)
  const out = ordered.map(sanitize)

  return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
```

Section 2 — Next.js profile slug: optional revalidate for caching

```typescript
// filepath: e:\VSCode_Repo\tech-oblivion-wpHeadless\app\api\wp\users\[slug]\route.ts
// ...existing code...
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const base = WP.replace(/\/$/, '')
  const url = new URL(`/wp-json/fe-auth/v1/public-user/${encodeURIComponent(slug)}`, base)

  const revalidate = Number(process.env.PROFILE_CACHE_SECONDS || '0')
  const fetchOpts: RequestInit = revalidate > 0
    ? ({ next: { revalidate } } as any)
    : { cache: 'no-store' }

  try {
    const res = await fetch(url.toString(), fetchOpts)
    // ...existing logic...
  } catch (e) {
    // ...existing logic...
  }
}
// ...existing code...
```

Section 3 — WP plugin: caching headers + compact mode on public-user

```php
// ...inside your public-user callback...
$compact = (bool) $req->get_param('compact');

// Build posts/comments with optional compacting
$posts = get_posts([
  'author' => $user->ID,
  'post_type' => 'post',
  'post_status' => 'publish',
  'orderby' => 'date',
  'order' => 'DESC',
  'posts_per_page' => 5,
]);

$recent_posts = array_map(function($p) use ($compact) {
  $item = [
    'id'    => (int)$p->ID,
    'title' => get_the_title($p),
    'slug'  => $p->post_name,
    'date'  => $p->post_date_gmt ?: $p->post_date,
    'link'  => get_permalink($p),
  ];
  if (!$compact) {
    $item['content_raw']      = $p->post_content;
    $item['content_rendered'] = apply_filters('the_content', $p->post_content);
  }
  return $item;
}, $posts);

$comments = get_comments([
  'user_id' => $user->ID,
  'status'  => 'approve',
  'number'  => 5,
  'orderby' => 'comment_date_gmt',
  'order'   => 'DESC',
]);

$recent_comments = array_map(function($c) use ($compact) {
  $item = [
    'id'   => (int)$c->comment_ID,
    'post' => (int)$c->comment_post_ID,
    'date' => $c->comment_date_gmt ?: $c->comment_date,
    'link' => get_comment_link($c),
  ];
  if (!$compact) {
    $item['content_raw']      = $c->comment_content;
    $item['content_rendered'] = apply_filters('comment_text', $c->comment_content, $c);
  }
  return $item;
}, $comments);

$payload = array_merge($base, [
  'recent_posts'    => $recent_posts,
  'recent_comments' => $recent_comments,
]);

// Add caching headers + ETag
$resp = new WP_REST_Response($payload);
$resp->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
$etag = '"' . md5(wp_json_encode([$user->ID, $recent_posts, $recent_comments])) . '"';
$resp->header('ETag', $etag);

if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
  return new WP_REST_Response(null, 304);
}

return $resp;
```

Why this helps

- Authors list: fewer bytes via _fields, single request with include[] batching.
- Profile: single call remains, but cache and compact mode reduce CPU and payload.
- Consistent social object everywhere; no field regressions.

Verification

- /api/wp/users?include=1,2: returns ordered, minimal author records with social.
- /api/wp/users/ajay: returns full profile; enable PROFILE_CACHE_SECONDS to cache briefly.
- /wp-json/fe-auth/v1/public-user/ajay?compact=1: returns lightweight profile; 200 with cache headers; 304
