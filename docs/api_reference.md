# API Reference

This document summarizes the Next.js API surface and how it maps to WordPress REST endpoints via direct calls or the FE Auth Bridge MU plugin.

## Next.js API Routes

### /api/admin

- Methods: GET
- Description: Admin health check; requires administrator role.

Example request:

```js
await fetch('/api/admin');
```

Example response:

```json
{ "ok": true }
```

### /api/auth/login

- Methods: POST
- Description: Login via WP JWT; sets Next.js session cookie and stores wpToken in session.

Example request:

```js
await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': '...'
  },
  body: JSON.stringify({ identifier: 'user', password: 'secret' })
});
```

Example response (shape):

```json
{ "user": { "id": 1, "username": "user", "email": "u@example.com", "displayName": "User" }, "token": "wp-jwt" }
```

### /api/auth/logout

- Methods: GET, POST
- Description: Clears session cookie; GET supports redirect via ?redirect=/path.

Example request:

```js
await fetch('/api/auth/logout', { method: 'POST' });
```

Example response:

```text
204 No Content
```

### /api/auth/me

- Methods: GET
- Description: Returns authenticated user from session, enriched from WP users/me when possible.

Example request:

```js
await fetch('/api/auth/me');
```

Example response (shape):

```json
{ "user": { "id": 1, "username": "user", "roles": ["subscriber"], "avatar_urls": { "48": "..." } } }
```

### /api/auth/register

- Methods: POST
- Description: Registers a new user via MU plugin endpoint.

Example request:

```js
await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': '...'
  },
  body: JSON.stringify({ email: 'e@x.com', password: 'secret', username: 'user' })
});
```

Example response (shape):

```json
{ "id": 123, "email": "e@x.com", "username": "user" }
```

### /api/csrf

- Methods: GET
- Description: Issues CSRF token cookie and returns token JSON for double-submit protection.

Example request:

```js
await fetch('/api/csrf');
```

Example response (shape):

```json
{ "token": "..." }
```

### /api/media-cache

- Methods: GET
- Description: Returns a local cached URL for a remote image (?url=...).

Example request:

```js
await fetch('/api/media-cache?url=https://example.com/image.jpg');
```

Example response (shape):

```json
{ "url": "/media-cache/abc123.jpg" }
```

### /api/media-cache/image

- Methods: GET
- Description: Redirects to a locally cached image for the given remote URL (?url=...).

Example request:

```http
GET /api/media-cache/image?url=https://example.com/image.jpg
```

Example response:

```text
302 Found (Location: /media-cache/...)
```

### /api/revalidate

- Methods: POST
- Description: Revalidates Next.js tags/pages using a shared secret.

Example request:

```js
await fetch('/api/revalidate?secret=...', {
  method: 'POST',
  body: JSON.stringify({ slug: 'post-slug' })
});
```

Example response (shape):

```json
{ "revalidated": ["/", "/blogs/post-slug"], "now": 1710000000000 }
```

### /api/test-wp

- Methods: GET
- Description: Connectivity diagnostics against WP REST and JWT token route.

Example request:

```js
await fetch('/api/test-wp');
```

Example response (shape):

```json
{ "success": true, "wpUrl": "...", "basicApiStatus": 200, "jwtApiStatus": 403 }
```

### /api/wp/comments

- Methods: GET, POST
- Description: List comments (GET) or create comment (POST with session wpToken).

Example request (GET):

```js
await fetch('/api/wp/comments?post=123&per_page=20');
```

Example response (GET, shape):

```json
[ { "id": 10, "post": 123, "author_name": "A", "content": { "rendered": "..." } } ]
```

Example request (POST):

```js
await fetch('/api/wp/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: 123, content: 'Nice post!' })
});
```

Example response (POST, shape):

```json
{ "id": 99, "post": 123, "status": "approved", "content": { "rendered": "..." } }
```

### /api/wp/media/[...slug]

- Methods: GET
- Description: Image proxy to WP or absolute URL; returns image bytes with cache headers.

Example request:

```http
GET /api/wp/media/wp-content/uploads/2024/10/hero.jpg
```

Example response:

```text
image/* bytes
```

### /api/wp/media/list

- Methods: GET
- Description: Lists WP media with passthrough query and caching.

Example request:

```js
await fetch('/api/wp/media/list?per_page=20');
```

Example response (shape):

```json
{ "items": [ { "id": 1, "source_url": "..." } ] }
```

### /api/wp/posts

- Methods: GET, POST, PATCH
- Description: GET lists posts; POST creates; PATCH updates by id.

Example request (GET):

```js
await fetch('/api/wp/posts?per_page=10&_embed=1');
```

Example response (GET, shape):

```json
[ { "id": 1, "slug": "hello", "title": { "rendered": "Hello" } } ]
```

### /api/wp/related

- Methods: GET
- Description: Related posts by categories/tags with simplified fields.

Example request:

```js
await fetch('/api/wp/related?categories=1,2&tags=3&exclude=10&per_page=5');
```

Example response (shape):

```json
[ { "id": 5, "slug": "post", "title": { "rendered": "..." } } ]
```

### /api/wp/search

- Methods: GET
- Description: Simple WP post search passthrough.

Example request:

```js
await fetch('/api/wp/search?q=nextjs');
```

Example response (shape):

```json
[ { "id": 1, "slug": "next", "title": { "rendered": "..." } } ]
```

### /api/wp/tags

- Methods: GET
- Description: Fetch WP tags (defined under src/app/api). See mapping below.

### /api/wp/tags/resolve

- Methods: POST
- Description: Resolve tag names to IDs for authoring flows (defined under src/app/api).

### /api/wp/categories

- Methods: GET
- Description: Fetch WP categories (defined under src/app/api). See mapping below.

### /api/wp/track-view

- Methods: POST
- Description: Proxies to MU route to increment post view counters, forwarding cookies to respect logged-in users.

Example request:

```js
await fetch('/api/wp/track-view', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: 123 })
});
```

Example response (shape):

```json
{ "post_id": 123, "views_total": 42, "user_views": 3 }
```

### /api/wp/bookmarks

- Methods: GET, POST
- Description: Proxy to MU endpoints for user bookmarks. GET returns current user's bookmarks or checks a specific post's bookmark state when passing ?postId=. POST toggles bookmark for a post.

Example request (check state):

```js
await fetch('/api/wp/bookmarks?postId=123');
```

Example response (shape):

```json
{ "post_id": 123, "bookmarked": true, "count": 5 }
```

Example request (toggle):

```js
await fetch('/api/wp/bookmarks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: 123 })
});
```

Example response (shape):

```json
{ "post_id": 123, "bookmarked": true, "count": 6 }
```

### /api/wp/users

- Methods: GET
- Description: Public user list/search via MU proxy or direct WP users.

Example request:

```js
await fetch('/api/wp/users?search=john&per_page=10');
```

Example response (shape):

```json
[ { "id": 7, "slug": "john", "name": "John Doe", "avatar_urls": { "48": "..." } } ]
```

### /api/wp/users/[slug]

- Methods: GET
- Description: Fetch public user by slug via MU public-user endpoint, sanitized.

Example request:

```js
await fetch('/api/wp/users/john-doe');
```

Example response (shape):

```json
{ "id": 7, "slug": "john-doe", "name": "John", "avatar_urls": { "48": "..." }, "profile_fields": { } }
```

### /api/wp/users/me

- Methods: GET, POST, PUT
- Description: Get or update the authenticated WP user via wpToken.

Example request:

```js
await fetch('/api/wp/users/me');
```

Example response (shape):

```json
{ "id": 1, "slug": "me", "name": "User", "profile_fields": { } }
```

### /api/wp/users/avatar

- Methods: POST
- Description: Uploads a new avatar image for the authenticated user using multipart/form-data. Uploads the file to WP Media and attempts to set user meta for local avatar.

Example request:

```http
POST /api/wp/users/avatar
Content-Type: multipart/form-data; boundary=---BOUNDARY

-----BOUNDARY
Content-Disposition: form-data; name="file"; filename="avatar.jpg"
Content-Type: image/jpeg

...binary...
-----BOUNDARY--
```

Example response (shape):

```json
{ "id": 321, "url": "https://wp.site/wp-content/uploads/avatar.jpg", "setInProfile": true }
```

## WordPress Endpoints (via Next.js)

- /api/wp/posts → /wp-json/wp/v2/posts
  - Proxy-first: /wp-json/fe-auth/v1/proxy?path=wp/v2/posts
  - Response shape: array of WP posts; Next.js may simplify in some routes.

- /api/wp/comments → /wp-json/wp/v2/comments
  - Proxy-first for GET; POST requires Authorization Bearer wpToken.
  - Response: list of comments (GET); created comment (POST).

- /api/wp/users → /wp-json/wp/v2/users (context=view)
  - Proxy-first via fe-auth/v1/proxy; falls back to direct if needed.
  - Response: array of users (sanitized in Next.js).

- /api/wp/users/[slug] → /wp-json/fe-auth/v1/public-user/{slug}
  - MU plugin endpoint; returns safe public profile (and extended fields if implemented).

- /api/wp/users/me → /wp-json/wp/v2/users/me (context=edit)
  - Direct with Bearer wpToken; proxy attempt first.

- /api/wp/users/avatar →
  - Upload: /wp-json/wp/v2/media (POST)
  - Update profile: /wp-json/wp/v2/users/me (POST with meta)

- /api/wp/related → /wp-json/wp/v2/posts
  - With categories/tags/exclude query; simplified fields returned.

- /api/wp/search → /wp-json/wp/v2/posts?search=...
  - Direct list; minimal fields.

- /api/wp/media/[...slug] → WP local file path or absolute URL
  - Direct fetch of bytes with cache control.

- /api/wp/media/list → /wp-json/wp/v2/media
  - Direct list with passthrough query.

- /api/wp/tags → /wp-json/wp/v2/tags
  - Implemented in src layer; proxy-first available.

- /api/wp/tags/resolve → Combines data from /wp-json/wp/v2/tags internally
  - Used to map tag names → IDs.

- /api/wp/categories → /wp-json/wp/v2/categories
  - Implemented in src layer; proxy-first available.

- /api/wp/track-view → /wp-json/fe-auth/v1/track-view (MU plugin)
  - Input: { post_id }; Output: { post_id, views_total, user_views }

- /api/auth/register → /wp-json/fe-auth/v1/register (MU plugin)
  - Registers users and returns created user info.

- /api/test-wp → /wp-json/wp/v2/posts, /wp-json/jwt-auth/v1/token (direct)
  - Diagnostics only.

## Examples

- GET posts (latest 10)

```bash
curl -s "https://your.site/api/wp/posts?per_page=10&_embed=1"
```

Response (shape):

```json
[
  { "id": 1, "slug": "hello-world", "title": { "rendered": "Hello World" } }
]
```

- Create comment

```bash
curl -s -X POST https://your.site/api/wp/comments \
  -H "Content-Type: application/json" \
  -d '{ "postId": 123, "content": "Nice post!" }'
```

Response (shape):

```json
{ "id": 456, "post": 123, "status": "approved", "content": { "rendered": "<p>Nice post!</p>" } }
```

- Track a view

```bash
curl -s -X POST https://your.site/api/wp/track-view \
  -H "Content-Type: application/json" \
  -d '{ "postId": 123 }'
```

Response (shape):

```json
{ "post_id": 123, "views_total": 42, "user_views": 3 }
```

- Public user by slug

```bash
curl -s "https://your.site/api/wp/users/john-doe"
```

Response (shape):

```json
{ "id": 7, "slug": "john-doe", "name": "John Doe", "avatar_urls": { "48": "..." }, "profile_fields": { } }
```

---

Notes

- “Proxy-first” indicates we attempt `/wp-json/fe-auth/v1/proxy` with HMAC headers (x-fe-ts, x-fe-sign) when FE_PROXY_SECRET is set; otherwise we call WP REST directly.
- Some routes live under the `src/app/api` mirror; behavior is the same at runtime.
- All examples omit full payloads and show only representative fields.
