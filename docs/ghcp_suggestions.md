# Suggestions and Improvements (GHCP)

- Title: Strengthen media fallback handling in `ClientImage`
  - Description: Add onError handler to swap to a low-res placeholder when remote image fails, avoiding broken layouts.
  - Potential risks: Minimal; ensure no layout shift by keeping dimensions.
  - Implementation notes: In `src/components/ui/client-image.tsx`, attach `onError` to set `src` to `fallbackSrc`. Keep width/height or `fill` unchanged.

- Title: Server TOC generation for accuracy
  - Description: Generate a table of contents from the sanitized HTML (h2/h3) server-side to avoid client discrepancies.
  - Potential risks: None significant; must maintain same classes and structure.
  - Implementation notes: Extract headings via regex/DOM parser in `app/blog/[slug]/page.tsx` just as we do now, but consider preserving anchor IDs if present.

- Title: Replace hardcoded author bio block
  - Description: The author bio section uses static copy. Fetch from WP user profile or ACF fields for accuracy.
  - Potential risks: Requires additional requests; ensure cached with ISR.
  - Implementation notes: Extend `getPostBySlug` to fetch user details endpoint if `_embedded.author` lacks bio fields.

- Title: Blog filters wired to API
  - Description: Search/category/sort controls are static. Wire them to feed query (search string, category IDs) without changing layout.
  - Potential risks: State management in a server component; likely move controls to a client wrapper.
  - Implementation notes: Add query params and pass to `getPosts`; use URLSearchParams to persist state.

- Title: Improve sanitize allowlist
  - Description: Consider allowing additional tags commonly present in WP content (e.g., `table`, `thead`, `tbody`, `tr`, `td`, `th`).
  - Potential risks: Slight XSS surface expansion; validate with sanitize-html config carefully.
  - Implementation notes: Extend `allowedTags` and attributes only if required by content; keep scripts/styles blocked.
