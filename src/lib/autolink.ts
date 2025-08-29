// Simple auto-linker: given content HTML and a list of {phrase, href},
// link only the first occurrence of each phrase, skip if already inside a link.
export type AutoLinkTarget = { phrase: string; href: string }

export function autoLinkFirst(html: string, targets: AutoLinkTarget[]): string {
  if (!targets?.length || !html) return html
  let out = html
  for (const t of targets) {
    const phrase = (t.phrase || '').trim()
    const href = (t.href || '').trim()
    if (!phrase || !href) continue
    // Avoid matching inside existing <a> tags using a tempered dot regex
    const re = new RegExp(`(?![^<]*>)(${escapeRegExp(phrase)})`, 'i')
    out = out.replace(re, (m, g1) => `<a href="${href}" rel="noopener" target="_blank">${g1}</a>`)
  }
  return out
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
