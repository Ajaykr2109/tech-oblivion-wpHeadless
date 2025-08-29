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

## Comments — future

- List/Create will require dedicated routes: /api/wp/comments (GET/POST)
  - Roles: list: public; create: subscriber+

## Media — existing

- List media: GET /api/wp/media/list
  - Roles: public (read-only media)
  - Uploads: to be added at /api/wp/media (POST) with RBAC (author+)

Notes

- All protected routes use the server-side session’s wpToken to call upstream WordPress. The token is never exposed to the browser.
- Server pages for /admin and /dashboard must also enforce role guards.
