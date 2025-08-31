# Next.js API Reference

This document summarizes the Next.js API surface and how it maps to WordPress REST endpoints via direct calls or the FE Auth Bridge MU plugin.

See also: proxy-map.md (generated), mapping.md (narrative), endpoints-wp.md (WP snapshot).

## Highlights

- /api/admin — Admin health check (administrator only)
- /api/auth/* — Login/logout/me/register
- /api/csrf — CSRF token helper
- /api/media-cache — Remote image cache
- /api/revalidate — ISR revalidation
- /api/test-wp — WP connectivity diagnostics
- /api/wp/* — WordPress proxy routes (posts, comments, users, media, taxonomies, etc.)

Refer to route files under app/api and src/app/api for exact behavior and payload shapes.
