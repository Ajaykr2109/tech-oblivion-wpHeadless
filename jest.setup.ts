import '@testing-library/jest-dom'

// Polyfill: Next.js may reference TextEncoder in some modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
if (!g.TextEncoder) {
  const { TextEncoder, TextDecoder } = require('util')
  g.TextEncoder = TextEncoder
  g.TextDecoder = TextDecoder
}
