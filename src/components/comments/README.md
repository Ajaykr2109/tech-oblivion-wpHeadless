# Comments module

This folder contains a modular, threaded comment system for blog posts.

Key parts:

- CommentsProvider: state, fetching, pagination, lazy reply loading, optimistic posting, moderation helpers.
- CommentEditor: inline composer for top-level and reply editors.
- CommentList: search, sort, load-more, skeletons.
- CommentItem: threaded item, markdown render, reply/edit/delete/spam, admin menu.
- AdminBulkBar: appears when admin selects comments for bulk moderation.

APIs used:

- /api/wp/comments (GET/POST) – existing
- /api/wp/comments/[id] (PATCH) – spam/approve/unapprove/trash/restore
- /api/wp/comments/bulk (POST) – bulk actions
- /api/comments/vote (POST) – stubbed
- /api/mod/audit (POST) – stubbed
- /api/mod/trust-user (POST) – stubbed

Notes:

- Usernames link to `/profile/[username]` (falls back to name if no slug).
- Guests can view but role-gated actions are disabled with contextual prompts.
- Edits are locally updated with an “(edited)” label; wire upstream edit when available.
- Unapproved comments are shown only to admins (pending badge) per spec.
- Replies are fetched on expand and prefetched on hover for snappy UX.
- State (sort/query/expanded) is persisted per post via `sessionStorage`.

Usage:

```tsx
<CommentsSection postId={Number(post.id)} />
```

To extend:

- Implement real voting and audit persistence.
- Add notifications for @mentions.
- Add infinite scroll for top-level threads if preferred over button.
