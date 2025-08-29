# UI/UX Audit Log

## 2025-08-30

- File: `app/blog/[slug]/page.tsx`
  - Before: Dynamic route used `params: Promise<{ slug: string }>` and destructured via `await params`, which caused prerender errors.
  - After: Correctly typed as `{ params: { slug: string } }` for both `generateMetadata` and the page component.
  - Rationale: Prevents undefined destructuring during static generation and improves reliability.

- File: `app/tags/[slug]/page.tsx`, `app/categories/[slug]/page.tsx`
  - Before: Same misuse of Promise params.
  - After: Fixed to `{ params: { slug: string } }`.
  - Rationale: Consistency and prevents build-time crashes.

- File: `app/blog/loading.tsx`
  - Before: Loading component attempted to fetch post by slug and destructure `params`, conflicting with route-level behavior.
  - After: Removed. Will rely on page-level loading UI patterns where relevant.
  - Rationale: Avoided incorrect assumptions and removed source of prerender failure.

- File: `app/blog/page.tsx`
  - Before: Feed rendered without a loading state.
  - After: Wrapped `Feed` in `<Suspense>` with a skeleton fallback.
  - Rationale: Better perceived performance and feedback during server data fetch.

- File: `src/components/feed-skeleton.tsx`
  - Added: New skeleton grid using existing `PostCardSkeleton` to match layouts.
  - Rationale: Consistent loading skeleton across feeds without breaking design.

- File: `src/components/Footer.tsx`
  - Before: Icon-only links without clear accessible labels and minimal focus styles.
  - After: Added aria-labels, sr-only text, and focus-visible ring styles on interactive icons.
  - Rationale: Accessibility and keyboard navigation improvements.

- File: `src/components/header.tsx`
  - Before: Links lacked focus styles and aria-current; menu buttons lacked aria attributes.
  - After: Added focus-visible styles, `aria-current` (best-effort), and improved button a11y labels.
  - Rationale: Improves accessibility and usability without changing visual hierarchy.

- File: `src/app/globals.css`
  - Before: Post content could span too wide; link focus styles were subtle.
  - After: Set `.wp-content` max-width to 75ch and centered; added enhanced focus-visible styles for links and buttons.
  - Rationale: Readability of long-form content and clearer keyboard focus indication.

- File: `app/login/page.tsx`
  - Before: Basic alerts and inputs without aria-live and autocomplete attributes.
  - After: Added aria-live to error alert, improved placeholders, and autocomplete hints; kept layout identical.
  - Rationale: Accessibility and form UX improvements without changing flow.

Notes:

- All changes are non-breaking UI polish and accessibility enhancements.
- No client-to-WordPress direct calls were introduced; architecture remains secure.

## 2025-08-30 (Homepage layout refinement)

- File: `src/app/page.tsx`
  - Reduced top padding and tightened vertical rhythm so Featured content is above the fold.
  - Switched to `grid grid-cols-1 md:grid-cols-2 items-start gap-8` to keep Recent Updates and Recent Posts aligned without stretching.
  - Wrapped Feed with a `.feed-conditional-4` container so the 4th item can be conditionally revealed by CSS.
  - Kept default posts at 3 visible; 4th appears when viewport height allows.

- File: `src/app/globals.css`
  - Added cross-browser CSS: hide Feed’s 4th card by default; reveal it via `@media (min-height: 820px)`.
  - Chosen to avoid JS measurements and sticky/overflow quirks in Safari and Edge.
  - Uses standard selectors and media queries for consistent behavior across Chrome/Firefox/Safari/Edge.

  ## 2025-08-30 (Blog rendering updates)

  - Cached Table of Contents: Built once per post (in-memory) using `src/lib/toc.ts`; skipped entirely when empty.
  - Auto-linking: Implemented `autoLinkFirst` to link only the first occurrence and avoid duplicates; no JS at runtime in client—applied server-side at render.
  - Maintained typography rhythm using existing prose classes; avoided extra heading stylization beyond scale/margins.
