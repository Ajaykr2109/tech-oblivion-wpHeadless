type CacheEntry<T> = { value: T; expiresAt: number; tags: Set<string> }

const store = new Map<string, CacheEntry<any>>()

export function getCache<T>(key: string): T | undefined {
  const now = Date.now()
  const hit = store.get(key)
  if (!hit) return undefined
  if (hit.expiresAt < now) {
    store.delete(key)
    return undefined
  }
  return hit.value as T
}

export function setCache<T>(key: string, value: T, ttlSeconds: number, tags: string[] = []) {
  const expiresAt = Date.now() + ttlSeconds * 1000
  store.set(key, { value, expiresAt, tags: new Set(tags) })
}

export function invalidateTags(tags: string[]) {
  const doomed = new Set(tags)
  for (const [k, v] of store.entries()) {
    if ([...v.tags].some(t => doomed.has(t))) {
      store.delete(k)
    }
  }
}

export async function cached<T>(key: string, ttlSeconds: number, tags: string[], loader: () => Promise<T>): Promise<T> {
  const hit = getCache<T>(key)
  if (hit !== undefined) return hit
  const value = await loader()
  setCache(key, value, ttlSeconds, tags)
  return value
}
