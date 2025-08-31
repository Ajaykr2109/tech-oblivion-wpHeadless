import sanitizeHtml, { SanitizeOptions } from 'sanitize-html'

import { decodeEntities } from './text'

// Include heading tags so we can build TOC and preserve document structure
const baseAllowedTags = ['a','b','i','strong','em','p','ul','ol','li','br','blockquote','code','pre','h1','h2','h3','h4','h5','h6']
// Do NOT include 'script' or 'style' in allowedTags
export const allowedTags = baseAllowedTags.concat(['img','figure','figcaption','iframe'])

export const allowedAttributes: Record<string, string[] | true> = {
  a: ['href','name','target','rel'],
  img: ['src','alt','title','width','height','srcset','sizes','loading','decoding'],
  iframe: ['src','width','height','title','allow','allowfullscreen','frameborder'],
  // Avoid allowing arbitrary inline style by default. If needed, whitelist specific style props via
  // a custom transform later. Keeping class/id only here prevents the sanitize-html warnings.
  '*': ['class','id'],
}

export function sanitizeWP(html: string) {
  const WP = process.env.WP_URL ?? ''

  const rewriteIfWP = (src: string): string => src

  // Define transforms separately to avoid narrow return-type inference on inline literals
  const transforms: NonNullable<SanitizeOptions['transformTags']> = {
    a(tag: string, attribs: Record<string, string>): { tagName: string; attribs: Record<string, string> } {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(attribs)) {
        if (typeof v === 'string') out[k] = v
      }
      out.rel = 'noopener noreferrer'
  return { tagName: 'a', attribs: out } as { tagName: string; attribs: Record<string, string> }
    },
    img(tag: string, attribs: Record<string, string>): { tagName: string; attribs: Record<string, string> } {
      // Build a fresh string-only attribs object using typed entries
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(attribs)) {
        if (typeof v === 'string') out[k] = v
      }
      if (Object.prototype.hasOwnProperty.call(out, 'src')) {
        // Only rewrite if src exists; never introduce undefined
        out.src = rewriteIfWP(out.src)
      }
  return { tagName: 'img', attribs: out } as { tagName: string; attribs: Record<string, string> }
    },
    iframe(tag: string, attribs: Record<string, string>): { tagName: string; attribs: Record<string, string> } {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(attribs)) {
        if (typeof v === 'string') out[k] = v
      }
  return { tagName: 'iframe', attribs: out } as { tagName: string; attribs: Record<string, string> }
    },
  }

  const options: SanitizeOptions = {
    allowedTags,
    allowedAttributes,
    // Use by-tag schemes to satisfy our types shim and keep behavior explicit
    allowedSchemesAppliedToAttributes: ['href','src'],
    allowProtocolRelative: false,
    allowedSchemesByTag: { iframe: ['http','https'] },
    transformTags: transforms,
  // Post-process style attributes embedded in CSS text (if any) to rewrite url(...) references
    textFilter: (text: string) => {
      if (!WP) return text
      return text.replace(/url\(([^)]+)\)/g, (m, g1) => {
        const raw = g1.trim().replace(/^['"]|['"]$/g, '')
        try {
          const u = new URL(raw)
          if (u.host === new URL(WP).host) {
            return `url(/api/wp/media${u.pathname}${u.search})`
          }
          return `url(${raw})`
        } catch (e) {
          return `url(${raw})`
        }
      })
    },
  }
  return sanitizeHtml(html, options)
}

export function renderUpdatesSummary(html: string, maxWords = 50) {
  const cleaned = decodeEntities(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }))
  // Split into sentences by full-stop and trim
  const sentences = cleaned.split('.')
    .map(s => s.trim())
    .filter(Boolean)
  // join with bullet and ensure maxWords
  const joined = sentences.join(' • ')
  const words = joined.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return joined
  return words.slice(0, maxWords).join(' ') + '...'
}
