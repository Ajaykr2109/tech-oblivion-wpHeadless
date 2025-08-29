# API Gaps

Date: 2025-08-30

- Likes for posts: WordPress core does not expose a standard likes count. Options:
  - Custom post meta via `/wp-json/wp/v2/posts/{id}` with meta enabled (requires register_meta and show_in_rest).
  - Or a custom REST endpoint (e.g., `/wp-json/techob/v1/likes`).
  - Action: // requires custom WP endpoint

- Username change limits: Core WP does not restrict username changes via REST (often disallowed). Policy to enforce "max twice in 6 months" requires local DB/cache.
  - Action: Implement local store and middleware to enforce; document in account_central.md.
