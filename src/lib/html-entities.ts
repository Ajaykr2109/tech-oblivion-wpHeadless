// Utility to decode basic HTML entities safely in both client and server contexts
// Covers the most common entities we see from WP content that sometimes arrives double-escaped.
// Falls back to regex replace for known entities when DOM not available (SSR / edge runtimes).

const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&#160;': ' ',
};

/**
 * Decode common HTML entities. If a browser DOM is available, we use a textarea decode fallback
 * which is more complete. For SSR / Node, we do a lightweight targeted replacement to avoid
 * adding heavier deps.
 */
export function decodeEntities(input: string | null | undefined): string {
  if (!input) return '';
  const str = String(input);
  // Quick bail-out if no ampersand
  if (!str.includes('&')) return str;

  // Browser path
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  // Targeted replace for known entities
  return str.replace(/&[a-zA-Z#0-9]+?;/g, (ent) => ENTITY_MAP[ent] || ent);
}

/** Convenience helper to decode then trim whitespace. */
export function decodeEntitiesTrim(input: string | null | undefined): string {
  return decodeEntities(input).trim();
}

// Basic unit-style helper for future expansions (placeholder to ensure tree-shaking keeps file)
export const __ENTITY_KEYS__ = Object.keys(ENTITY_MAP);
