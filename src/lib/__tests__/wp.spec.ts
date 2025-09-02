import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const HTML_503 = `<!DOCTYPE html><html><head><title>Maintenance</title></head><body><p>Site under maintenance</p></body></html>`

describe('wp helpers - resilience', () => {
  let originalFetch: typeof globalThis.fetch
  beforeEach(() => {
    originalFetch = globalThis.fetch
  process.env.WP_URL = 'https://techoblivion.test'
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('getPosts should throw when WP returns 503 HTML', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable', headers: { get: () => 'text/html' }, text: async () => HTML_503 })
  const { getPosts } = await import('../wp')
  await expect(getPosts()).rejects.toThrow(/WP posts 503/)
  })

  it('getPostBySlug should throw when WP returns 503 HTML', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable', headers: { get: () => 'text/html' }, text: async () => HTML_503 })
  const { getPostBySlug } = await import('../wp')
  await expect(getPostBySlug('nope')).rejects.toThrow(/WP post 503/)
  })
})
