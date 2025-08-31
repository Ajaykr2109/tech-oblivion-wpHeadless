## Caching & Revalidation

- WordPress data fetches use Next.js ISR with tags for targeted revalidation.
- TTL can be tuned via `WP_CACHE_TTL` (seconds), default 300.
- Tags used:
  - List: `wp:posts`
  - Post: `wp:post:{slug}`
  - Page: `wp:page:{slug}`

Trigger revalidation (server-to-server or webhook):

POST /api/revalidate?secret=YOUR_SECRET
{
  "slug": "post-slug"   // optional, revalidates that post detail
}

POST /api/revalidate?secret=YOUR_SECRET
{
  "page": "about"       // optional, revalidates that page detail
}

POST /api/revalidate?secret=YOUR_SECRET
{
  "all": true            // optional, refreshes the homepage & list
}

For advanced in-process caching of custom loaders, use `src/lib/serverCache.ts`.

This project implements a Next.js App Router frontend that proxies WordPress auth via API routes.

## Authors API (minimal, fast)

- Route: `GET /api/wp/users?include=1,2,3`
- Backed by `wp-json/wp/v2/users` with `include[]` batching and `_fields=id,slug,name,description,avatar_urls,social` to reduce payload.
- Output: ordered array of users with a consistent `social` object `{ twitter|null, linkedin|null, github|null }`. URLs are normalized to `https://` if missing scheme.
- Intended for authors lists and bylines; use the profile route below for full details.

## Profile API caching

- Route: `GET /api/wp/users/[slug]`
- Upstream: single call to `fe-auth/v1/public-user/{slug}`.
- Optional Next.js cache: set `PROFILE_CACHE_SECONDS` (number of seconds) to enable ISR-style caching for this API route. When not set or `0`, it uses `no-store`.
- The upstream plugin may also emit HTTP cache headers and support `?compact=1` to trim payload — see WordPress plugin notes below.

## Api Routes

* `/wp-json/wp/v2/posts` → All published posts (title, content, excerpt, etc.).
* `/wp-json/wp/v2/pages` → All public pages.
* `/wp-json/wp/v2/media` → Media library info (URLs, captions).
* `/wp-json/wp/v2/categories`, `/tags` → Taxonomies.
* `/wp-json/wp/v2/users`
  - Prefer `GET /api/wp/users?include=...` from the frontend for minimal, ordered authors data.

## Key features:

- Proxy auth: POST /api/auth/login, /api/auth/register, /api/auth/logout, GET /api/auth/me
- HttpOnly session cookie is set on login (7 days)
- CSRF double-submit: cookie 'csrf' must match x-csrf-token header for mutating routes
- Middleware protects /dashboard and /account
- Blog list and post pages fetch from WP REST and render server-side

## Testing

1. Set environment in `.env.local`.
2. Start dev server: npm run dev
3. Visit `/register` to create account. With AIOS email activation, expect 201 { status: 'pending_verification' } and UI shows pending message.
4. Try to login before verification → expect 401 and friendly message.
5. After verifying via WP email link, login should succeed and set HttpOnly cookie. Visiting `/dashboard` should show the user.

## Instant cache purge / webhook

1. Configure your WordPress site (or a webhook plugin) to POST to the revalidation endpoint when a post is published/updated.

- Endpoint: https://your-site.com/api/revalidate?secret=change-me-long-random
- Body: { "slug": "the-post-slug" }
- To revalidate lists instead, send { "all": true } or call the endpoint with ?secret=...&all=true

## CI / developer checks

- Add these to CI for a cheap safety net:
  - npm run typecheck
  - npm run build
  - npm test

Deployment & secrets
--------------------

When you deploy to production, do NOT keep production secrets in `.env.local` inside the repo. Use your host's environment variable/secret manager (Vercel, Netlify, AWS/GCP/Azure, etc.). Required production env vars:

- `WP_URL` (your WordPress URL)
- `JWT_SECRET` (long random secret, used to sign session JWTs)
- `NEXT_REVALIDATE_SECRET` (secret for the revalidate webhook)
- `NEXT_PUBLIC_SITE_URL` (your public frontend URL)
- `SESSION_COOKIE_NAME` (optional, cookie name; keep consistent)
- `PROFILE_CACHE_SECONDS` (optional, seconds to cache `/api/wp/users/[slug]` responses on the Next.js side)

Quick secret generation examples (PowerShell):

```powershell
# 64 bytes hex
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 48
```

Local pre-deploy env check
--------------------------

Add this to CI to fail fast if required production env vars are missing:

```bash
npm run check-env
```

This runs a tiny validator that ensures required env keys are present when `NODE_ENV=production`.

## WordPress → Next.js Revalidation

When a post/page is published or updated in WordPress, we ping our Next.js route to invalidate cached HTML.

### Next.js

- Route: POST /api/revalidate
- Secret: NEXT_REVALIDATE_SECRET in `.env.local`
- Body: `{ "slug": "<post-slug>" }` (or `{ "all": true }` to refresh lists)

### WordPress setup

Use the MU plugin at `wp-content/mu-plugins/next-revalidate.php`.

**Env vars on WP**

- `NEXT_REVALIDATE_URL` → https://<frontend-domain>/api/revalidate
- `NEXT_REVALIDATE_SECRET` → same as Next’s `NEXT_REVALIDATE_SECRET`

**What it does**

- On publish/update of `post` or `page`, it POSTs `{ slug, secret }`.
- Next.js calls `revalidateTag('wp:post:{slug}')` and optionally `revalidateTag('wp:posts')`.
- Only affected pages are purged. SEO wins, users get fresh content.

### WordPress public-user endpoint (performance)

Update your `fe-auth` public-user callback to:

- Accept `?compact=1` to omit heavy rendered content in recent posts/comments.
- Add HTTP caching headers and ETag. Example:

```
$resp->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
$resp->header('ETag', '"' . md5(wp_json_encode([$user->ID, $recent_posts, $recent_comments])) . '"');
```

Verification:

- `/api/wp/users?include=1,2` returns ordered minimal authors with `social`.
- `/api/wp/users/ajay` returns full profile; set `PROFILE_CACHE_SECONDS` to cache briefly.
- `/wp-json/fe-auth/v1/public-user/ajay?compact=1` returns lightweight profile with cache headers (200/304 as appropriate).

### Manual test

```bash
curl -X POST https://<frontend>/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug":"hello-world","secret":"<NEXT_REVALIDATE_SECRET>"}' -i
```

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Security model (WP headless)

- The browser never talks to WordPress directly for data or auth; all requests go through Next.js server routes under `/api/wp/*` and `/api/auth/*`.
- We store the upstream WordPress JWT token inside the server-signed session to perform privileged actions; it is never exposed to the browser.
- See `docs/api-reference/button-api-map.md` for the current mapping of UI actions to internal APIs and required roles.

## Unified Admin + Analytics

- Unified Admin Dashboard at `/admin` combines Analytics, Moderation, and Settings in a tabbed UI (Tailwind + Radix Tabs).
- Single normalized analytics endpoint: `GET /api/analytics/summary` → `GET {WP}/wp-json/fe-analytics/v1/summary`.
- WordPress caches with transients; frontend caches with React Query (staleTime 60s, gcTime 5m).
- Role-aware: access limited to `administrator` for now, enforced both server-side (WP REST permission) and client-side (React role guard).
