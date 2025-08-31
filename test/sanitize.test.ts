import { describe, it, expect } from 'vitest'

import { sanitizeWP } from '../src/lib/sanitize'

describe('sanitizeWP', () => {
  it('removes script tags and preserves safe content', () => {
    const dirty = `<p>Hello <strong>world</strong></p><script>alert(1)</script><a href="http://example.com">link</a>`
    const clean = sanitizeWP(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('<a')
    expect(clean).toContain('Hello')
  })
})
