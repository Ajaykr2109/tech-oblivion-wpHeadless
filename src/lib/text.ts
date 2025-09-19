// Utilities for converting HTML to readable text and decoding entities
import { decodeEntities } from './entities'

// Strip HTML tags
export function stripTags(html: string): string {
  return (html || '').replace(/<[^>]+>/g, '')
}

// Re-export decodeEntities from entities module for backwards compatibility
export { decodeEntities }

// Convert HTML to plain text: strip tags then decode entities
export function htmlToText(html: string): string {
  return decodeEntities(stripTags(html || ''))
}
