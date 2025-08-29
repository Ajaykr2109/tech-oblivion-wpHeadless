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
    },
  })
}
