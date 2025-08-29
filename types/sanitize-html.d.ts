declare module 'sanitize-html' {
  interface IDefaults {
    allowedTags: string[]
    allowedAttributes: Record<string, string[]>
  }
  function sanitizeHtml(dirty: string, options?: any): string
  export default sanitizeHtml
}
