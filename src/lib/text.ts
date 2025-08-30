// Utilities for converting HTML to readable text and decoding entities

// Strip HTML tags
export function stripTags(html: string): string {
  return (html || '').replace(/<[^>]+>/g, '')
}

// Decode common HTML entities, including numeric (dec/hex)
export function decodeEntities(s: string): string {
  if (!s) return ''
  let out = s
  // Named basic entities
  const named: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }
  out = out.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => named[m] || m)
  // Numeric decimal
  out = out.replace(/&#(\d+);/g, (_, dec: string) => {
    const code = Number(dec)
    return Number.isFinite(code) ? String.fromCodePoint(code) : _
  })
  // Numeric hex
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
    const code = parseInt(hex, 16)
    return Number.isFinite(code) ? String.fromCodePoint(code) : _
  })
  return out
}

// Convert HTML to plain text: strip tags then decode entities
export function htmlToText(html: string): string {
  return decodeEntities(stripTags(html || ''))
}
