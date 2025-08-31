# Frontend API to WordPress REST Mapping

Perfect — this is essentially your **API gateway spec** between Next.js and WordPress. Right now it’s **user-focused** (auth, posts, bookmarks, etc.). For an **admin-level view**, we need to bring in:

* **User management** (all users, role management)
* **Site settings**
* **Taxonomies (categories, tags)**
* **Media management** (upload/delete, not just view)
* **Comments moderation**
* **Plugins & themes visibility**
* **Site health/analytics**

And since this is a **reference doc**, we’ll add a **Table of Contents with anchors** for easy navigation.

Here’s the **restructured doc with admin endpoints appended**:

# Frontend API → WordPress REST Mapping

This document maps the **Next.js frontend API routes** to their corresponding **WordPress REST endpoints** (core + MU plugin).
Designed for both **general users** and **admin-level operations**.

## 📑 Table of Contents

* [Auth](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#auth)
* [Users](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#users)
* [Posts](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#posts)
* [Comments](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#comments)
* [Media](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#media)
* [Taxonomies](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#taxonomies)
* [Admin / Site Settings](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#admin--site-settings)
* [Plugins & Themes](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#plugins--themes)
* [Site Health](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#site-health)
* [Misc (MU)](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#misc-mu)
* [Site Utilities](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#site-utilities)
* [Conventions](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#conventions)

---

## Auth

* `POST /api/auth/login` → `POST {WP}/jwt-auth/v1/token` (exchange) + session issue
* `GET/POST /api/auth/logout` → clears FE session cookie
* `GET /api/auth/me` → `GET {WP}/wp/v2/users/me?context=edit` (bearer wpToken)
* `POST /api/auth/register` → `POST {WP}/fe-auth/v1/register` (if plugin enabled)

## Users

* `GET /api/wp/users` → `GET {WP}/wp/v2/users?{query}`
* `GET /api/wp/users/[slug]` → `GET {WP}/fe-auth/v1/public-user/{slug}`
* `GET/POST/PUT /api/wp/users/me` → `{WP}/wp/v2/users/me` (bearer wpToken)
* `GET /api/wp/users/avatar` → `GET {WP}/wp/v2/media/{id}`

**Admin-only Extensions:**

* `POST /api/wp/users` → `POST {WP}/wp/v2/users` (create new user)
* `PATCH /api/wp/users/[id]` → `PUT/PATCH {WP}/wp/v2/users/{id}` (update role, meta)
* `DELETE /api/wp/users/[id]` → `DELETE {WP}/wp/v2/users/{id}`

---

## Posts

* `GET /api/wp/posts` → `GET {WP}/wp/v2/posts?{query}`
* `POST /api/wp/posts` → `POST {WP}/wp/v2/posts` (bearer wpToken)
* `PATCH /api/wp/posts/[id]` → `PATCH {WP}/wp/v2/posts/{id}` (bearer wpToken)
* `GET /api/wp/related` → `GET {WP}/wp/v2/posts?{query by categories/tags}`
* `GET /api/wp/search` → `GET {WP}/wp/v2/search?search={q}`

**Admin-only Extensions:**

* `DELETE /api/wp/posts/[id]` → `DELETE {WP}/wp/v2/posts/{id}`
* `GET /api/wp/posts/[id]/revisions` → `GET {WP}/wp/v2/posts/{id}/revisions`

---

## Comments

* `GET /api/wp/comments` → `GET {WP}/wp/v2/comments?{query}`
* `POST /api/wp/comments` → `POST {WP}/wp/v2/comments` (bearer wpToken)

**Admin-only Extensions:**

* `PATCH /api/wp/comments/[id]` → `PUT/PATCH {WP}/wp/v2/comments/{id}` (approve/unapprove)
* `DELETE /api/wp/comments/[id]` → `DELETE {WP}/wp/v2/comments/{id}`

---

## Media

* `GET /api/wp/media/[...slug]` → `GET {WP}{/path}` (binary) with caching
* `GET /api/wp/media/list` → `GET {WP}/wp/v2/media?{query}`

**Admin-only Extensions:**

* `POST /api/wp/media` → `POST {WP}/wp/v2/media` (file upload)
* `PATCH /api/wp/media/[id]` → `PUT/PATCH {WP}/wp/v2/media/{id}` (update alt text, title, etc.)
* `DELETE /api/wp/media/[id]` → `DELETE {WP}/wp/v2/media/{id}`

---

## Taxonomies

* `GET /api/wp/categories` → `GET {WP}/wp/v2/categories`
* `GET /api/wp/tags` → `GET {WP}/wp/v2/tags`

**Admin-only Extensions:**

* `POST /api/wp/categories` → `POST {WP}/wp/v2/categories` (create new category)
* `PATCH /api/wp/categories/[id]` → `PATCH {WP}/wp/v2/categories/{id}`
* `DELETE /api/wp/categories/[id]` → `DELETE {WP}/wp/v2/categories/{id}`
* Same pattern applies for `/tags`

---

## Admin / Site Settings

* `GET /api/wp/settings` → `GET {WP}/wp/v2/settings`
* `PATCH /api/wp/settings` → `POST {WP}/wp/v2/settings` (update site title, tagline, timezone)

---

## Plugins & Themes

* `GET /api/wp/themes` → `GET {WP}/wp/v2/themes`
* `GET /api/wp/plugins` → `GET {WP}/wp/v2/plugins`
* `POST /api/wp/plugins/[id]` → `POST {WP}/wp/v2/plugins` (activate/deactivate if supported)

---

## Site Health

* `GET /api/wp/site-health/background-updates` → `GET {WP}/wp-site-health/v1/tests/background-updates`
* `GET /api/wp/site-health/directory-sizes` → `GET {WP}/wp-site-health/v1/directory-sizes`

---

## Misc (MU)

* `POST /api/wp/track-view` → `POST {WP}/fe-auth/v1/track-view`
* `GET /api/wp/bookmarks` → `GET {WP}/fe-auth/v1/bookmarks` (requires login)
* `GET /api/wp/bookmarks?postId=123` → `GET {WP}/fe-auth/v1/bookmarks/check?post_id=123`
* `POST /api/wp/bookmarks` → `POST {WP}/fe-auth/v1/bookmarks/toggle { post_id }`

---

## Site Utilities

* `GET /robots.txt` → computed in `app/robots.txt/route.ts`
* `GET /sitemap.xml` → computed in `app/sitemap.xml/route.ts`

---

## Conventions

* All Next.js routes forward cookies to preserve auth on WP side.
* User-scoped requests: `no-store` caching.
* Public list endpoints may apply caching or ISR revalidation.
* Frontend prefers `content_raw` (Markdown) → falls back to `content.rendered` (HTML).

---

👉 With this structure, you’ve got **user endpoints, admin extensions, site/system endpoints**, and it’s all navigable with a TOC.

Would you like me to also **color-code roles** (e.g., ✅ Everyone, 🔑 Authenticated, 👑 Admin) next to each route so you can instantly see access levels?

# Frontend API → WordPress REST Mapping

This document maps the **Next.js frontend API routes** to their corresponding **WordPress REST endpoints** (core + MU plugin).
Designed for both **general users** and **admin-level operations**.

## 📑 Table of Contents

* [Auth](#auth)
* [Users](#users)
* [Posts](#posts)
* [Comments](#comments)
* [Media](#media)
* [Taxonomies](#taxonomies)
* [Admin / Site Settings](#admin--site-settings)
* [Plugins & Themes](#plugins--themes)
* [Site Health](#site-health)
* [Misc (MU)](#misc-mu)
* [Site Utilities](#site-utilities)
* [Conventions](#conventions)

## Auth

* `POST /api/auth/login` → `POST {WP}/jwt-auth/v1/token` (exchange) + session issue
* `GET/POST /api/auth/logout` → clears FE session cookie
* `GET /api/auth/me` → `GET {WP}/wp/v2/users/me?context=edit` (bearer wpToken)
* `POST /api/auth/register` → `POST {WP}/fe-auth/v1/register` (if plugin enabled)

---

## Users

* `GET /api/wp/users` → `GET {WP}/wp/v2/users?{query}`
* `GET /api/wp/users/[slug]` → `GET {WP}/fe-auth/v1/public-user/{slug}`
* `GET/POST/PUT /api/wp/users/me` → `{WP}/wp/v2/users/me` (bearer wpToken)
* `GET /api/wp/users/avatar` → `GET {WP}/wp/v2/media/{id}`

**Admin-only Extensions:**

Perfect — this is essentially your **API gateway spec** between Next.js and WordPress. Right now it’s **user-focused** (auth, posts, bookmarks, etc.). For an **admin-level view**, we need to bring in:

* **User management** (all users, role management)
* **Site settings**
* **Taxonomies (categories, tags)**
* **Media management** (upload/delete, not just view)
* **Comments moderation**
* **Plugins & themes visibility**
* **Site health/analytics**

And since this is a **reference doc**, we’ll add a **Table of Contents with anchors** for easy navigation.

Here’s the **restructured doc with admin endpoints appended**:

---

# Frontend API → WordPress REST Mapping

This document maps the **Next.js frontend API routes** to their corresponding **WordPress REST endpoints** (core + MU plugin).
Designed for both **general users** and **admin-level operations**.

---

## 📑 Table of Contents

* [Auth](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#auth)
* [Users](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#users)
* [Posts](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#posts)
* [Comments](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#comments)
* [Media](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#media)
* [Taxonomies](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#taxonomies)
* [Admin / Site Settings](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#admin--site-settings)
* [Plugins & Themes](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#plugins--themes)
* [Site Health](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#site-health)
* [Misc (MU)](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#misc-mu)
* [Site Utilities](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#site-utilities)
* [Conventions](https://chatgpt.com/c/68b34168-71e0-8329-a91d-9945aa18d0d4#conventions)

---

## Auth

* `POST /api/auth/login` → `POST {WP}/jwt-auth/v1/token` (exchange) + session issue
* `GET/POST /api/auth/logout` → clears FE session cookie
* `GET /api/auth/me` → `GET {WP}/wp/v2/users/me?context=edit` (bearer wpToken)
* `POST /api/auth/register` → `POST {WP}/fe-auth/v1/register` (if plugin enabled)

---

## Users

* `GET /api/wp/users` → `GET {WP}/wp/v2/users?{query}`
* `GET /api/wp/users/[slug]` → `GET {WP}/fe-auth/v1/public-user/{slug}`
* `GET/POST/PUT /api/wp/users/me` → `{WP}/wp/v2/users/me` (bearer wpToken)
* `GET /api/wp/users/avatar` → `GET {WP}/wp/v2/media/{id}`

**Admin-only Extensions:**

* `POST /api/wp/users` → `POST {WP}/wp/v2/users` (create new user)
* `PATCH /api/wp/users/[id]` → `PUT/PATCH {WP}/wp/v2/users/{id}` (update role, meta)
* `DELETE /api/wp/users/[id]` → `DELETE {WP}/wp/v2/users/{id}`

---

## Posts

* `GET /api/wp/posts` → `GET {WP}/wp/v2/posts?{query}`
* `POST /api/wp/posts` → `POST {WP}/wp/v2/posts` (bearer wpToken)
* `PATCH /api/wp/posts/[id]` → `PATCH {WP}/wp/v2/posts/{id}` (bearer wpToken)
* `GET /api/wp/related` → `GET {WP}/wp/v2/posts?{query by categories/tags}`
* `GET /api/wp/search` → `GET {WP}/wp/v2/search?search={q}`

**Admin-only Extensions:**

* `DELETE /api/wp/posts/[id]` → `DELETE {WP}/wp/v2/posts/{id}`
* `GET /api/wp/posts/[id]/revisions` → `GET {WP}/wp/v2/posts/{id}/revisions`

---

## Comments

* `GET /api/wp/comments` → `GET {WP}/wp/v2/comments?{query}`
* `POST /api/wp/comments` → `POST {WP}/wp/v2/comments` (bearer wpToken)

**Admin-only Extensions:**

* `PATCH /api/wp/comments/[id]` → `PUT/PATCH {WP}/wp/v2/comments/{id}` (approve/unapprove)
* `DELETE /api/wp/comments/[id]` → `DELETE {WP}/wp/v2/comments/{id}`

---

## Media

* `GET /api/wp/media/[...slug]` → `GET {WP}{/path}` (binary) with caching
* `GET /api/wp/media/list` → `GET {WP}/wp/v2/media?{query}`

**Admin-only Extensions:**

* `POST /api/wp/media` → `POST {WP}/wp/v2/media` (file upload)
* `PATCH /api/wp/media/[id]` → `PUT/PATCH {WP}/wp/v2/media/{id}` (update alt text, title, etc.)
* `DELETE /api/wp/media/[id]` → `DELETE {WP}/wp/v2/media/{id}`

---

## Taxonomies

* `GET /api/wp/categories` → `GET {WP}/wp/v2/categories`
* `GET /api/wp/tags` → `GET {WP}/wp/v2/tags`

**Admin-only Extensions:**

* `POST /api/wp/categories` → `POST {WP}/wp/v2/categories` (create new category)
* `PATCH /api/wp/categories/[id]` → `PATCH {WP}/wp/v2/categories/{id}`
* `DELETE /api/wp/categories/[id]` → `DELETE {WP}/wp/v2/categories/{id}`
* Same pattern applies for `/tags`

---

## Admin / Site Settings

* `GET /api/wp/settings` → `GET {WP}/wp/v2/settings`
* `PATCH /api/wp/settings` → `POST {WP}/wp/v2/settings` (update site title, tagline, timezone)

---

## Plugins & Themes

* `GET /api/wp/themes` → `GET {WP}/wp/v2/themes`
* `GET /api/wp/plugins` → `GET {WP}/wp/v2/plugins`
* `POST /api/wp/plugins/[id]` → `POST {WP}/wp/v2/plugins` (activate/deactivate if supported)

---

## Site Health

* `GET /api/wp/site-health/background-updates` → `GET {WP}/wp-site-health/v1/tests/background-updates`
* `GET /api/wp/site-health/directory-sizes` → `GET {WP}/wp-site-health/v1/directory-sizes`

---

## Misc (MU)

* `POST /api/wp/track-view` → `POST {WP}/fe-auth/v1/track-view`
* `GET /api/wp/bookmarks` → `GET {WP}/fe-auth/v1/bookmarks` (requires login)
* `GET /api/wp/bookmarks?postId=123` → `GET {WP}/fe-auth/v1/bookmarks/check?post_id=123`
* `POST /api/wp/bookmarks` → `POST {WP}/fe-auth/v1/bookmarks/toggle { post_id }`

---

## Site Utilities

* `GET /robots.txt` → computed in `app/robots.txt/route.ts`
* `GET /sitemap.xml` → computed in `app/sitemap.xml/route.ts`

---

## Conventions

* All Next.js routes forward cookies to preserve auth on WP side.
* User-scoped requests: `no-store` caching.
* Public list endpoints may apply caching or ISR revalidation.
* Frontend prefers `content_raw` (Markdown) → falls back to `content.rendered` (HTML).

---

👉 With this structure, you’ve got **user endpoints, admin extensions, site/system endpoints**, and it’s all navigable with a TOC.

Would you like me to also **color-code roles** (e.g., ✅ Everyone, 🔑 Authenticated, 👑 Admin) next to each route so you can instantly see access levels?

* `POST /api/wp/users` → `POST {WP}/wp/v2/users` (create new user)
* `PATCH /api/wp/users/[id]` → `PUT/PATCH {WP}/wp/v2/users/{id}` (update role, meta)
* `DELETE /api/wp/users/[id]` → `DELETE {WP}/wp/v2/users/{id}`

---

## Posts

* `GET /api/wp/posts` → `GET {WP}/wp/v2/posts?{query}`
* `POST /api/wp/posts` → `POST {WP}/wp/v2/posts` (bearer wpToken)
* `PATCH /api/wp/posts/[id]` → `PATCH {WP}/wp/v2/posts/{id}` (bearer wpToken)
* `GET /api/wp/related` → `GET {WP}/wp/v2/posts?{query by categories/tags}`
* `GET /api/wp/search` → `GET {WP}/wp/v2/search?search={q}`

**Admin-only Extensions:**

* `DELETE /api/wp/posts/[id]` → `DELETE {WP}/wp/v2/posts/{id}`
* `GET /api/wp/posts/[id]/revisions` → `GET {WP}/wp/v2/posts/{id}/revisions`

---

## Comments

* `GET /api/wp/comments` → `GET {WP}/wp/v2/comments?{query}`
* `POST /api/wp/comments` → `POST {WP}/wp/v2/comments` (bearer wpToken)

**Admin-only Extensions:**

* `PATCH /api/wp/comments/[id]` → `PUT/PATCH {WP}/wp/v2/comments/{id}` (approve/unapprove)
* `DELETE /api/wp/comments/[id]` → `DELETE {WP}/wp/v2/comments/{id}`

---

## Media

* `GET /api/wp/media/[...slug]` → `GET {WP}{/path}` (binary) with caching
* `GET /api/wp/media/list` → `GET {WP}/wp/v2/media?{query}`

**Admin-only Extensions:**

* `POST /api/wp/media` → `POST {WP}/wp/v2/media` (file upload)
* `PATCH /api/wp/media/[id]` → `PUT/PATCH {WP}/wp/v2/media/{id}` (update alt text, title, etc.)
* `DELETE /api/wp/media/[id]` → `DELETE {WP}/wp/v2/media/{id}`

---

## Taxonomies

* `GET /api/wp/categories` → `GET {WP}/wp/v2/categories`
* `GET /api/wp/tags` → `GET {WP}/wp/v2/tags`

**Admin-only Extensions:**

* `POST /api/wp/categories` → `POST {WP}/wp/v2/categories` (create new category)
* `PATCH /api/wp/categories/[id]` → `PATCH {WP}/wp/v2/categories/{id}`
* `DELETE /api/wp/categories/[id]` → `DELETE {WP}/wp/v2/categories/{id}`
* Same pattern applies for `/tags`

---

## Admin / Site Settings

* `GET /api/wp/settings` → `GET {WP}/wp/v2/settings`
* `PATCH /api/wp/settings` → `POST {WP}/wp/v2/settings` (update site title, tagline, timezone)

---

## Plugins & Themes

* `GET /api/wp/themes` → `GET {WP}/wp/v2/themes`
* `GET /api/wp/plugins` → `GET {WP}/wp/v2/plugins`
* `POST /api/wp/plugins/[id]` → `POST {WP}/wp/v2/plugins` (activate/deactivate if supported)

---

## Site Health

* `GET /api/wp/site-health/background-updates` → `GET {WP}/wp-site-health/v1/tests/background-updates`
* `GET /api/wp/site-health/directory-sizes` → `GET {WP}/wp-site-health/v1/directory-sizes`

---

## Misc (MU)

* `POST /api/wp/track-view` → `POST {WP}/fe-auth/v1/track-view`
* `GET /api/wp/bookmarks` → `GET {WP}/fe-auth/v1/bookmarks` (requires login)
* `GET /api/wp/bookmarks?postId=123` → `GET {WP}/fe-auth/v1/bookmarks/check?post_id=123`
* `POST /api/wp/bookmarks` → `POST {WP}/fe-auth/v1/bookmarks/toggle { post_id }`

---

## Site Utilities

* `GET /robots.txt` → computed in `app/robots.txt/route.ts`
* `GET /sitemap.xml` → computed in `app/sitemap.xml/route.ts`

---

## Conventions

* All Next.js routes forward cookies to preserve auth on WP side.
* User-scoped requests: `no-store` caching.
* Public list endpoints may apply caching or ISR revalidation.
* Frontend prefers `content_raw` (Markdown) → falls back to `content.rendered` (HTML).

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
