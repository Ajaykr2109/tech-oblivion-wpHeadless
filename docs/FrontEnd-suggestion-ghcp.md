# Frontend UI/UX and QoL Suggestions (GHCP)

This document captures non-breaking UI/UX and quality-of-life suggestions to consider after the current frontend optimization. Do not implement until approved. Each item includes title, description, risks, and implementation notes.

- Title: Skeleton and shimmer placeholders for Feed and Post
  - Description: Show consistent skeleton states (matching card/list layout) while data loads to reduce perceived latency.
  - Potential risks: Overuse can feel busy; ensure durations are short and subtle.
  - Implementation notes: Reuse existing `post-card-skeleton.tsx` and keep the same grid/list classes to prevent layout shifts.

- Title: Image error fallback and blur-up
  - Description: Avoid broken images by swapping to a fallback; keep blur placeholders for perceived performance.
  - Potential risks: Fallbacks must preserve dimensions to avoid CLS.
  - Implementation notes: Add `onError` in `ClientImage` to swap to `fallbackSrc`; keep width/height or `fill` unchanged.

- Title: Accurate reading time
  - Description: Calculate reading time with words-per-minute and include code/blockquote weighting if needed.
  - Potential risks: Minor CPU cost; cache with ISR.
  - Implementation notes: Compute on the server from sanitized HTML; keep the same text placement and classes.

- Title: Anchorable headings and inline TOC links
  - Description: Generate stable IDs for h2/h3 and link the TOC to them for better navigation.
  - Potential risks: ID collisions; normalize and dedupe.
  - Implementation notes: Preserve current TOC UI; add `id` to headings in sanitized HTML.

- Title: Copy-to-clipboard for code blocks
  - Description: Small button to copy code snippets improves developer UX.
  - Potential risks: Needs clear focus states and accessible labels.
  - Implementation notes: Place a visually minimal button in the code block container; maintain spacing.

- Title: Accessible focus states and skip links
  - Description: Ensure keyboard navigation, visible focus states, and a skip-to-content link.
  - Potential risks: None if styles match theme tokens.
  - Implementation notes: Use Tailwind focus utilities consistent with existing palette.

- Title: Color contrast audit (light/dark)
  - Description: Verify all text/icon contrast meets WCAG AA in both themes.
  - Potential risks: May require slight token tweaks; avoid altering component structure.
  - Implementation notes: Prefer token-level adjustments (e.g., `text-muted-foreground`).

- Title: Reduced motion preference support
  - Description: Honor `prefers-reduced-motion` to soften animations/transitions.
  - Potential risks: None; ensure animation durations are theme-driven.
  - Implementation notes: Wrap hover/transition utilities with motion-safe variants.

- Title: Consistent card heights in grid
  - Description: Prevent jank from uneven content by ensuring card bodies flex evenly.
  - Potential risks: Over-constraining can truncate content.
  - Implementation notes: Keep existing `flex` classes; align title/excerpt line clamps.

- Title: Pagination with identical layout (no UI changes)
  - Description: Replace static post count with real pagination or cursor-based fetching.
  - Potential risks: SEO concerns for infinite scrolling; keep SSR paths paginated.
  - Implementation notes: Use query params and server `getPosts`; keep grid/list layout unchanged.

- Title: Blog filters wiring (search, category, sort)
  - Description: Make current controls functional without changing their appearance.
  - Potential risks: State management; ensure URL params reflect selections.
  - Implementation notes: Wrap controls in a small client component that updates search params and re-renders Feed.

- Title: Share links accessibility
  - Description: Ensure Twitter/LinkedIn/GitHub icons have accessible names and focus behavior.
  - Potential risks: None.
  - Implementation notes: Add `aria-label` and `title` to links; keep exact icon placement/classes.

- Title: Author bio from server
  - Description: Replace static author bio text with data from WP profile/ACF.
  - Potential risks: Extra request; cache via ISR.
  - Implementation notes: Extend `getPostBySlug` or a user fetcher; map into existing bio block without changing layout.

- Title: Related posts fallback
  - Description: If no related posts, show a friendly, non-intrusive message in the same area or hide block cleanly.
  - Potential risks: None.
  - Implementation notes: Maintain sidebar spacing; avoid layout shifts.

- Title: Error and empty states audit
  - Description: Ensure every fetch surface has a graceful message/skeleton consistent with design.
  - Potential risks: Message verbosity; keep copy concise.
  - Implementation notes: Reuse muted foreground styles used elsewhere.

- Title: Breadcrumbs (optional)
  - Description: Provide lightweight breadcrumbs for context, especially on deep content.
  - Potential risks: Must not crowd the header.
  - Implementation notes: Place above H1 with muted small text; keep existing spacing scale.

- Title: Prefetch next/previous post links
  - Description: Improve perceived navigation speed between posts.
  - Potential risks: Network overhead; limit to hover or viewport proximity.
  - Implementation notes: Use `Link` prefetch defaults or `IntersectionObserver` to prefetch nearby links.

- Title: LCP image tuning
  - Description: Ensure only the hero image uses `priority`; others lazy-load.
  - Potential risks: Misuse can hurt CLS/LCP.
  - Implementation notes: Keep hero priority; ensure `sizes` reflect actual layout breakpoints.

- Title: Consistent icon sizes and tap targets
  - Description: Standardize icon button sizes for touch.
  - Potential risks: Crowding if too large.
  - Implementation notes: Align with `h-5 w-5` and 40–44px touch targets; keep existing spacing classes.

- Title: Table and media inside prose
  - Description: Support common WP content like tables and responsive iframes in the same prose container.
  - Potential risks: Sanitization surface area increases.
  - Implementation notes: Extend sanitize allowlist cautiously (table, thead, tbody, tr, td, th) and add responsive wrappers.

- Title: Toasts for user actions
  - Description: Feedback for actions like comment submission (future) or copy.
  - Potential risks: Overuse can be noisy.
  - Implementation notes: Reuse existing `use-toast` hook and `toaster` component; place unobtrusively.

- Title: Consistent spacing scale
  - Description: Audit vertical rhythm across sections to maintain consistent spacing.
  - Potential risks: None if tokens are used; avoid class churn.
  - Implementation notes: Document spacing tokens and apply only where drift is observed.

- Title: 404/empty search messaging polish
  - Description: Friendly, on-brand copy for empty results and 404.
  - Potential risks: None.
  - Implementation notes: Keep typography classes; adjust text only.

- Title: Perf QoL: minimize client JS
  - Description: Keep components server-first; only client-ify interactive parts.
  - Potential risks: Event handling needs careful boundaries.
  - Implementation notes: Verify `"use client"` is only on interactive components; keep existing APIs.

- Title: Bundle and route-level analysis
  - Description: Identify heavy modules and reduce unused client imports.
  - Potential risks: None if changes are deferred.
  - Implementation notes: Use Next’s bundle analyzer; suggestions will avoid UI changes.

- Title: Preconnect to image/CDN origins
  - Description: Faster image fetches by preconnecting to WP/gravatar/CDN.
  - Potential risks: Unused connections on low-traffic pages.
  - Implementation notes: Add `<link rel="preconnect">` via metadata only for known hosts; keep existing head structure.

- Title: Service worker (optional) for read-through cache
  - Description: Offline-first reading for recently visited posts.
  - Potential risks: Cache invalidation complexity.
  - Implementation notes: Start with runtime caching of images and post HTML; keep UI unchanged.

- Title: Content width and typographic measure
  - Description: Ensure optimal line length for readability across breakpoints.
  - Potential risks: None if container widths unchanged.
  - Implementation notes: Keep current `max-w-4xl`/`prose` containers; adjust only if measure exceeds best practices.
