import { decodeEntities } from '../lib/html-entities'

describe('decodeEntities', () => {
  it('decodes common named entities', () => {
    expect(decodeEntities('A &amp; B &lt; C &gt; D &quot;x&quot;')).toBe('A & B < C > D "x"')
  })
  it('decodes numeric entities', () => {
    expect(decodeEntities('Quote: &#34; and apos &#39;')).toBe('Quote: " and apos \'' )
  })
  it('returns original when no entities', () => {
    expect(decodeEntities('Plain text')).toBe('Plain text')
  })
  it('handles empty values', () => {
    expect(decodeEntities('')).toBe('')
    expect(decodeEntities(null)).toBe('')
    expect(decodeEntities(undefined)).toBe('')
  })
})
