import { describe, it, expect } from 'vitest'

describe('wpFetch env guard', () => {
  it('throws when WP_URL is not set', async () => {
    // Ensure env var is absent for this test
    const orig = process.env.WP_URL
    delete process.env.WP_URL
    // Dynamically import to get fresh module state
  const mod = await import('../fetcher')
    try {
      await expect(mod.wpFetch('/wp-json/')).rejects.toThrow(/WP_URL env required/)
    } finally {
      if (orig !== undefined) process.env.WP_URL = orig
    }
  })
})
