export function decodeEntities(input: string): string {
  if (!input) return ''
  // Use a browser DOM element to decode standard entities on client
  if (typeof window !== 'undefined') {
    const txt = document.createElement('textarea')
    txt.innerHTML = input
    let out = txt.value
    // strip any still-unresolved entity like &and; or malformed
    out = out.replace(/&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/g, (m) => {
      // try decoding again; if unchanged, drop it
      txt.innerHTML = m
      const v = txt.value
      return v === m ? '' : v
    })
    return out
  }
  // On server, do a light decode for common entities
  const map: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
  }
  return input.replace(/&[a-zA-Z#0-9]+;/g, (m) => (map[m] ?? ''))
}
