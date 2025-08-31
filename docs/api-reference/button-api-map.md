# Button ↔ API Mapping and RBAC

This document maps visible UI actions to internal API routes that proxy WordPress. The browser must never call WordPress directly; images are the only exception.

Legend:

- Roles: subscriber, contributor, author, editor, administrator

## Global Nav

- Login (Header)
  - Endpoint: POST /api/auth/login
  - Payload: { identifier, password }
  - Roles: public

- Logout (Header)
  - Endpoint: POST /api/auth/logout
  - Roles: any (requires session)

- Admin menu (Header)
  - Visibility: editor, administrator
  - Links target SSR pages which will enforce server guards.

- Dashboard menu (Header)
  - Visibility: subscriber, contributor, author, editor, administrator

## Feed / Blog

- Load more (ClientFeed)
  - Endpoint: GET /api/wp/posts?page={n}&per_page={k}&_embed=1
  - Roles: public

- Related posts (sidebar and within article)
  - Endpoint: GET /api/wp/related?categories={csv}&tags={csv}&exclude={id}&per_page={k}
  - Roles: public

- Single post (SSR fetch)
  - Endpoint: server helper getPostBySlug -> WordPress /wp/v2/posts?slug={slug}
  - Roles: public

## Editor (New / Edit) — planned wiring

- Save Draft
  - Endpoint: POST /api/wp/posts
  - Body: { title, content, status: 'draft', categories, tags }
  - Roles: author, editor, administrator

- Publish
  - Endpoint: POST /api/wp/posts
  - Body: { title, content, status: 'publish', categories, tags }
  - Roles: author, editor, administrator

- Update Post
  - Endpoint: PATCH /api/wp/posts?id={postId}
  - Body: partial post fields (e.g., { title, content, status })
  - Roles: author (own posts), editor, administrator

## Comments — implemented

- List comments
  - Endpoint: GET /api/wp/comments?post={postId}&order={desc|asc}&page={n}&per_page={k}
  - Upstream: /wp-json/wp/v2/comments
  - Roles: public
  - Notes: component supports client-side sort and search; server returns latest first by default.

- Create comment
  - Endpoint: POST /api/wp/comments
  - Body: { postId: number, content: string, parent?: number }
  - Upstream: POST /wp-json/wp/v2/comments (Authorization: Bearer wpToken)
  - Roles: subscriber, contributor, author, editor, administrator
  - UI: Composer is role-gated; guests see login prompt; disabled state respected.

## Media — existing

- List media: GET /api/wp/media/list
  - Roles: public (read-only media)
  - Uploads: to be added at /api/wp/media (POST) with RBAC (author+)

Notes

- All protected routes use the server-side session’s wpToken to call upstream WordPress. The token is never exposed to the browser.
- Server pages for /admin and /dashboard must also enforce role guards.

## Floating actions / Reader UX

- Share
  - Endpoint: none (Web Share API / clipboard)
  - Roles: public

- Bookmark (planned)
  - Endpoint: POST /api/user/bookmarks { postId } and GET /api/user/bookmarks
  - Storage: WP user meta via custom endpoint or app DB
  - Roles: subscriber+
  - UI: Button is shown but disabled for unauthorized users (role-gated)

- Print
  - Endpoint: none (window.print)
  - Roles: public

## Not covered by core WP (requires custom endpoints or meta)

- Reactions (likes/hearts) for posts/comments
  - Suggested: POST /api/reactions; store counts in post/comment meta; list via GET
- View counts
  - Suggested: POST /api/metrics/view; aggregate/report via GET; or server-side tracking
- Bookmarks/saves & follows
  - Suggested: /api/user/bookmarks, /api/user/follows; store in user meta or app DB
