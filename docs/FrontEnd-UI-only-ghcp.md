# Frontend UI Suggestions (UI-only, GHCP)

These are visual/UI-only suggestions to consider after optimization. No behavior changes implied. Each item includes Title, Description, Potential risks, and Implementation notes. Do not implement until approved.

- Title: Spacing scale & vertical rhythm
  - Description: Audit section paddings and inter-block margins to keep consistent rhythm across pages.
  - Potential risks: Over-tightening may truncate content if line clamps remain.
  - Implementation notes: Standardize on existing Tailwind spacing tokens (e.g., mb-2/4/8/12); avoid changing component trees.

- Title: Typography hierarchy & measure
  - Description: Ensure heading sizes (H1–H3), line-height, and line-length keep a readable measure across breakpoints.
  - Potential risks: Large changes can shift layout; keep adjustments subtle.
  - Implementation notes: Keep current classes; if needed, adjust only scale tokens (text-2xl/3xl/5xl) and max-widths (e.g., max-w-3xl/4xl) without moving blocks.

- Title: Color tokens & contrast (light/dark)
  - Description: Verify text/icon contrast meets WCAG AA without changing the palette’s look.
  - Potential risks: Over-darkening muted text can reduce visual hierarchy.
  - Implementation notes: Prefer tweaking token mappings (text-muted-foreground, border) rather than per-element classes.

- Title: Focus, hover, active states consistency
  - Description: Unify interactive states for links/buttons/cards to feel consistent.
  - Potential risks: Excessive glow/shadow can distract.
  - Implementation notes: Use ring and shadow tokens consistently; ensure focus-visible outlines match theme.

- Title: Card grid alignment & equal visual height
  - Description: Keep card layouts visually even in grid mode with consistent title/excerpt clamps.
  - Potential risks: Over-constrained heights may clip longer titles.
  - Implementation notes: Maintain existing flex and line-clamp classes; adjust only clamp values if needed.

- Title: Border radius & elevation tokens
  - Description: Normalize rounded corners and shadows across cards, modals, popovers.
  - Potential risks: Inconsistent radius can look mismatched with existing design.
  - Implementation notes: Use shared tokens for rounded-md/lg and shadow-sm/md/lg; avoid per-component overrides.

- Title: Image aspect ratios & cropping
  - Description: Ensure consistent aspect ratios for hero and card images; avoid unexpected cropping on small screens.
  - Potential risks: Changing ratios may shift fold content.
  - Implementation notes: Keep current aspect classes (aspect-[3/2], aspect-video); use object-cover and consistent rounded corners.

- Title: Blur placeholder tuning
  - Description: Keep blur intensity and duration subtle for LCP and card images.
  - Potential risks: Heavy blur can feel laggy.
  - Implementation notes: Maintain current `placeholder="blur"` styling; ensure blurDataURL or default works visually with theme.

- Title: Prose content styles (lists, tables, quotes)
  - Description: Align list bullet spacing, table borders, and blockquote accents with the theme.
  - Potential risks: Over-styled tables can clash.
  - Implementation notes: Use prose modifiers (dark:prose-invert) and minimal borders; keep the same container and spacing classes.

- Title: Code block theme consistency
  - Description: Ensure code block background, text color, and radius match the site theme.
  - Potential risks: High contrast can overpower body text.
  - Implementation notes: Keep `github-dark.css`; wrap in subtle background and rounded corners matching cards.

- Title: TOC visual polish
  - Description: Maintain readable indentation, wrapping for long headings, and subtle active-state styling.
  - Potential risks: Over-highlighting can distract from content.
  - Implementation notes: Keep the current sticky sidebar and spacing; consider a muted active indicator only.

- Title: Breadcrumbs (optional, UI only)
  - Description: Add a lightweight breadcrumb above the H1 with muted small text and separators.
  - Potential risks: Crowding the header area if spacing isn’t balanced.
  - Implementation notes: Place within the existing container; use small text and subdued color.

- Title: Badges for categories/tags
  - Description: Ensure badge sizes, colors, and radii are consistent where shown.
  - Potential risks: Too many badge colors can look noisy.
  - Implementation notes: Reuse existing badge component variants; keep spacing between badges tight but readable.

- Title: Forms visual alignment
  - Description: Align icons inside inputs, placeholder colors, and control heights for visual harmony.
  - Potential risks: Overly small placeholders reduce legibility.
  - Implementation notes: Keep current input/select components; tune only padding and icon alignment classes if needed.

- Title: Header/footer visual balance
  - Description: Confirm header border/blur and footer spacing feel balanced in both themes.
  - Potential risks: Strong borders may feel heavy.
  - Implementation notes: Use subtle border and backdrop utilities already present; keep heights unchanged.

- Title: Loading skeletons consistency
  - Description: Ensure skeletons match final card/list dimensions to prevent shifts.
  - Potential risks: Mismatched skeletons cause visual jank.
  - Implementation notes: Reuse existing skeleton components and exact grid/list wrappers.

- Title: Icon sizing & tap targets
  - Description: Normalize icon sizes and ensure comfortable tap targets for touch.
  - Potential risks: Oversized icons can dominate.
  - Implementation notes: Prefer h-5 w-5 icons; ensure clickable areas ~40–44px without changing layout.

- Title: Modal/sheet/overlay visuals
  - Description: Keep overlays consistent (opacity/blur) and modal radii/shadows unified.
  - Potential risks: Excessive blur reduces readability.
  - Implementation notes: Use existing sheet/dialog tokens; maintain current spacing and z-index.

- Title: Link styles and affordances
  - Description: Ensure inline links in prose are clearly distinguishable without overpowering body text.
  - Potential risks: Heavy underlines can clutter.
  - Implementation notes: Use subtle underline/decoration on hover; keep muted color by default.

- Title: Content width (readability)
  - Description: Keep optimal line length (60–80ch) for article body.
  - Potential risks: Too narrow feels cramped on desktop.
  - Implementation notes: Maintain current `max-w-4xl` and container padding; only adjust if needed.
