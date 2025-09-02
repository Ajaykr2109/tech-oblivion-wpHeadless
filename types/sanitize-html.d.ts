declare module 'sanitize-html' {
  export interface SanitizeOptions {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[] | boolean> | false
    allowedSchemesAppliedToAttributes?: string[]
    allowProtocolRelative?: boolean
    allowedSchemesByTag?: Record<string, string[]>
    // Transform tags must return string-only attributes; callers should coerce/omit non-strings
    transformTags?: Record<string, (tagName: string, attribs: Record<string, string>) => { tagName: string; attribs: Record<string, string> }>
    textFilter?: (text: string) => string
  }
  function sanitizeHtml(dirty: string, options?: SanitizeOptions): string
  export default sanitizeHtml
}
