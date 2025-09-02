import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill: Next.js may reference TextEncoder in some modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
if (!g.TextEncoder) {
  g.TextEncoder = TextEncoder
  g.TextDecoder = TextDecoder
}
