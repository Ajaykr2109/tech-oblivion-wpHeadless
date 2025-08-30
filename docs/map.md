# Frontend API to WordPress REST Mapping

This document maps the Next.js frontend API routes to their corresponding WordPress REST endpoints (core and MU plugin).

Notes

- Base WP URL is configured via `WP_URL` (server) or `NEXT_PUBLIC_WP_URL` (client-visible). All WP requests strip a trailing slash.
- MU routes are provided by the FE Auth Bridge plugin family (e.g., public user, bookmarks, track-view).

## Auth

- POST /api/auth/login → POST {WP}/jwt-auth/v1/token (exchange) + session issue
- GET/POST /api/auth/logout → clears FE session cookie
- GET /api/auth/me → GET {WP}/wp/v2/users/me (context=edit, bearer wpToken) for enrichment
- POST /api/auth/register → POST {WP}/wp-json/fe-auth/v1/register (if plugin enabled)

## Users

- GET /api/wp/users → GET {WP}/wp/v2/users?{query}
- GET /api/wp/users/[slug] → GET {WP}/fe-auth/v1/public-user/{slug}
- GET/POST/PUT /api/wp/users/me → {WP}/wp/v2/users/me with bearer wpToken
- GET /api/wp/users/avatar → GET {WP}/wp/v2/media/{id} (used for resolving avatar as needed)

## Posts

- GET /api/wp/posts → GET {WP}/wp/v2/posts?{query}
- POST /api/wp/posts → POST {WP}/wp/v2/posts (bearer wpToken)
- PATCH /api/wp/posts → PATCH {WP}/wp/v2/posts/{id} (bearer wpToken)
- GET /api/wp/related → GET {WP}/wp/v2/posts?{query based on categories/tags}
- GET /api/wp/search → GET {WP}/wp/v2/search?search={q}

## Comments

- GET /api/wp/comments → GET {WP}/wp/v2/comments?{query}
- POST /api/wp/comments → POST {WP}/wp/v2/comments (bearer wpToken)

## Media

- GET /api/wp/media/[...slug] → GET absolute URL or GET {WP}{/path} (binary) with caching
- GET /api/wp/media/list → GET {WP}/wp/v2/media?{query}

## Misc (MU)

- POST /api/wp/track-view → POST {WP}/fe-auth/v1/track-view
- GET /api/wp/bookmarks → GET {WP}/fe-auth/v1/bookmarks (requires login)
- GET /api/wp/bookmarks?postId=123 → GET {WP}/fe-auth/v1/bookmarks/check?post_id=123 (requires login)
- POST /api/wp/bookmarks → POST {WP}/fe-auth/v1/bookmarks/toggle { post_id } (requires login)

## Site

- GET /robots.txt → app/robots.txt/route.ts (computed)
- GET /sitemap.xml → app/sitemap.xml/route.ts (computed)

## Conventions

- All Next.js routes forward cookies to preserve auth on the WP side when needed.
- Caching: most proxies use `no-store` for user-scoped requests; list endpoints may apply caching or revalidation per route.
- For content fields, the FE prefers `content_raw` (Markdown) when available and falls back to `content.rendered` (HTML).
