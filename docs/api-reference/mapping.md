# Frontend API → WordPress mapping (narrative)

This guide explains how our Next.js API routes map to WordPress REST endpoints, why the proxy exists, and how roles and caching are applied.

What to read first:

- proxy-map.md — one-line map from /api/* to upstream WP
- proxy-map-with-roles.md — same table with RBAC columns
- roles-matrix.md — per-route/method RBAC details


Key concepts

- Proxy-first: When FE_PROXY_SECRET is set, /api/wp/* tries the MU proxy at /wp-json/fe-auth/v1/proxy with HMAC headers (x-fe-ts, x-fe-sign); otherwise we call WP directly.
- Cookies-forwarding: API routes forward cookies to preserve WP auth where needed.
- Caching: User-scoped endpoints are no-store; public list endpoints may use cache or ISR revalidateTag.
- Content shape: Prefer content_raw (Markdown) and fall back to content.rendered (HTML).
- Safety: We sanitize, narrow fields, and unify shapes on some routes (e.g., related, public user).

Scope

- Users: public-user by slug; current user (me) read/update; avatar upload.
- Posts: list/create/update; related; search; revisions (admin UI).
- Comments: list/create; moderate/update/delete (Editor+/Admin).
- Media: list/upload/update/delete; image proxy.
- Taxonomies: categories/tags list and create/update/delete.
- Admin/systems: settings, plugins/themes listing, site-health tests.
- MU features: bookmarks, track-view; analytics (views, devices, countries, referers, summary, top-posts).

Tips for authors and reviewers

- For new routes, add to src/config/apiRolesMatrix.ts first, then implement.
- Prefer proxy-map tables for quick checks; use roles-matrix for method-level gatekeeping.
- Keep examples in docs/api-reference/nextjs.md concise and link back to route files for details.
