# Frontend Scaffold Audit Checklist

Use this checklist while restructuring the frontend to keep core behaviors intact. Check off each item before merging.

## 1) Environment & configuration

- [ ] .env.local updated (see .env.example)
- [ ] WP_URL points to the correct WordPress origin
- [ ] NEXT_PUBLIC_SITE_URL/SITE_URL set to the site’s public base URL
- [ ] JWT secrets and cookie names present (if auth is used)
- [ ] next.config.ts images.remotePatterns include WP/gravatar hosts you use
- [ ] Consider allowedDevOrigins note from Next (LAN dev) — informational for now

## 2) Routing & app structure

- [ ] Root layout at `src/app/layout.tsx` exports `default` and `generateMetadata` only
- [ ] `app/layout.tsx` re-exports `{ default, generateMetadata }` from `../src/app/layout`
- [ ] Error boundary exists at `app/error.tsx` (re-exports your error UI)
- [ ] robots + sitemap routes exist in `app/robots.txt/route.ts` and `app/sitemap.xml/route.ts`

## 3) SEO/metadata

- [ ] `generateMetadata` sets `metadataBase` from settings/env
- [ ] Defaults (title/description/OG/Twitter) come from `src/lib/settings.ts`
- [ ] Per-post metadata (if any) is still wired on blog pages

## 4) Media strategy

Current mode: Direct WP image URLs via Next/Image (simplified; no proxy).

- [ ] Next/Image configured for WP/gravatar/CDN hosts in `next.config.ts`
- [ ] Components use `ClientImage` (blur + fallback) or `next/image`
- [ ] If switching back to proxy/cached later, toggle points:
  - `src/lib/wp.ts` featuredImage/avatar mapping
  - `src/lib/sanitize.ts` content image rewrites
  - API routes under `app/api/wp/media/*` and `/api/media-cache*`

## 5) Data layer + fetch

- [ ] `src/lib/fetcher.ts` apiFetch uses relative URLs in the browser; absolute on server
- [ ] Client components that fetch (e.g., `RelatedPostsSidebar`) use `fetch('/api/...')`
- [ ] WP fetchers in `src/lib/wp.ts` still add polite headers and ISR cache

## 6) Security

- [ ] Auth utils: `src/lib/auth.ts`, `src/lib/jwt.ts` intact
- [ ] CSRF helpers: `src/lib/csrf.ts` available where forms/POST are used
- [ ] Sanitization: `src/lib/sanitize.ts` in place; no script/style allowed

## 7) Admin/Settings

- [ ] Settings store: `data/site-settings.json` (file-backed) — keep this file
- [ ] `src/lib/settings.ts` merges env defaults + file overrides
- [ ] Admin pages (if any) guarded server-side by role checks

## 8) ISR & revalidation

- [ ] WP fetches use `next: { revalidate: WP_CACHE_TTL }`
- [ ] Revalidation endpoint present (`app/api/revalidate/route.ts`) if used

## 9) Build & quality gates

- [ ] Typecheck (tsc) passes
- [ ] Build (next build) completes
- [ ] ESLint (optional during scaffold) acceptable

## 10) Smoke tests

- [ ] Home page loads (no server component crash)
- [ ] Blog post page loads; related posts fetch succeeds
- [ ] Images render from allowed remote hosts
- [ ] robots.txt and sitemap.xml return 200

## Reference file map

- Settings: `src/lib/settings.ts` + `data/site-settings.json`
- SEO: `src/app/layout.tsx`, blog page metadata
- Media (direct mode): `src/lib/wp.ts`, `src/components/ui/client-image.tsx`, `next.config.ts`
- Fetching: `src/lib/fetcher.ts`, `src/components/RelatedPostsSidebar.tsx`
- Security: `src/lib/auth.ts`, `src/lib/jwt.ts`, `src/lib/csrf.ts`, `src/lib/sanitize.ts`
- SEO files: `app/robots.txt/route.ts`, `app/sitemap.xml/route.ts`

## Notes

- During scaffold, prefer relative URLs in client code to avoid base-URL drift in dev.
- If you add new remote image hosts, whitelist them in `next.config.ts`.
- Keep `data/site-settings.json` out of version control if it contains sensitive data (current .gitignore keeps it tracked; change as needed).
