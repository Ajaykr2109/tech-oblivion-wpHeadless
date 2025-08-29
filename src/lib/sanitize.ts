import sanitizeHtml from 'sanitize-html'

const baseAllowedTags = ['a','b','i','strong','em','p','ul','ol','li','br','blockquote','code','pre']
export const allowedTags = baseAllowedTags.concat(['img','figure','figcaption','iframe'])

export const allowedAttributes: any = {
  a: ['href','name','target','rel'],
  img: ['src','alt','title','width','height','srcset','sizes','loading','decoding'],
  iframe: ['src','width','height','title','allow','allowfullscreen','frameborder'],
  '*': ['class','id','style'],
}

export function sanitizeWP(html: string) {
  const WP = process.env.WP_URL ?? ''

  function rewriteIfWP(src?: string) {
    if (!src) return src
    if (!WP) return src
    try {
      const u = new URL(src)
      const wpHost = new URL(WP).host
      if (u.host === wpHost) {
        return `/api/wp/media${u.pathname}${u.search}`
      }
      return src
    } catch (e) {
      return src
    }
  }

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
      iframe: (tag: any, attribs: any) => ({
        tagName: 'iframe',
        attribs: { ...attribs, src: rewriteIfWP(attribs.src) }
      }),
    },
    // Post-process style attributes to rewrite url(...) references if they point to WP
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
  const cleaned = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
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
