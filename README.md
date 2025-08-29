This project implements a Next.js App Router frontend that proxies WordPress auth via API routes.

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

Quick secret generation examples (PowerShell):

```powershell
# 64 bytes hex
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 48
```

Local pre-deploy env check
-------------------------
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

### Manual test

```bash
curl -X POST https://<frontend>/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"slug":"hello-world","secret":"<NEXT_REVALIDATE_SECRET>"}' -i
```


# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
