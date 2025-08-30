import sanitizeHtml from 'sanitize-html'
import { decodeEntities } from './text'

const baseAllowedTags = ['a','b','i','strong','em','p','ul','ol','li','br','blockquote','code','pre']
// Do NOT include 'script' or 'style' in allowedTags
export const allowedTags = baseAllowedTags.concat(['img','figure','figcaption','iframe'])

export const allowedAttributes: any = {
  a: ['href','name','target','rel'],
  img: ['src','alt','title','width','height','srcset','sizes','loading','decoding'],
  iframe: ['src','width','height','title','allow','allowfullscreen','frameborder'],
  // Avoid allowing arbitrary inline style by default. If needed, whitelist specific style props via
  // a custom transform later. Keeping class/id only here prevents the sanitize-html warnings.
  '*': ['class','id'],
}

export function sanitizeWP(html: string) {
  const WP = process.env.WP_URL ?? ''

  const rewriteIfWP = (src?: string) => src

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http','https','mailto','tel'],
    allowedSchemesAppliedToAttributes: ['href','src'],
    allowProtocolRelative: false,
    allowedSchemesByTag: { iframe: ['http','https'] },
    transformTags: {
      a: (tag: any, attribs: any) => ({
        tagName: 'a',
        attribs: { ...attribs, rel: 'noopener noreferrer' }
      }),
      img: (tag: any, attribs: any) => ({
        tagName: 'img',
        attribs: { ...attribs, src: rewriteIfWP(attribs.src) }
      }),
  iframe: (tag: any, attribs: any) => ({ tagName: 'iframe', attribs }),
    },
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
  })
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
