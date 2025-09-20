// Lightweight fetch helper with timeout, retry and JSON-safe parsing
export async function safeFetchJSON<T = unknown>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
  retries = 2
): Promise<T | null> {
  const { timeoutMs = 8000, ...rest } = init

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { ...rest, signal: controller.signal })
      clearTimeout(id)
      if (!res.ok) {
        // Non-2xx still attempt retries; final attempt returns null
        if (attempt === retries) return null
        continue
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (await res.json()) as any
        return data as T
      } catch {
        // Not JSON – return null gracefully
        return null
      }
    } catch {
      if (attempt === retries) return null
    }
  }
  return null
}

export async function safeFetchText(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
  retries = 2
): Promise<string | null> {
  const { timeoutMs = 8000, ...rest } = init
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { ...rest, signal: controller.signal })
      clearTimeout(id)
      if (!res.ok) {
        if (attempt === retries) return null
        continue
      }
      return await res.text()
    } catch {
      if (attempt === retries) return null
    }
  }
  return null
}
