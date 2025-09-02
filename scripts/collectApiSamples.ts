import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const OUT = path.resolve(process.cwd(), 'docs/api-reference/samples')

const routes: { url: string; file: string }[] = [
  { url: '/api/test-wp', file: 'test-wp.json' },
  { url: '/api/wp/posts?per_page=1', file: 'wp-posts-1.json' },
  { url: '/api/analytics/summary', file: 'analytics-summary.json' },
  { url: '/api/wp/users/me', file: 'wp-users-me.json' },
  { url: '/api/wp/categories?per_page=1', file: 'wp-categories-1.json' },
  { url: '/api/wp/tags?per_page=1', file: 'wp-tags-1.json' },
]

async function go() {
  fs.mkdirSync(OUT, { recursive: true })
  for (const r of routes) {
    const url = new URL(r.url, BASE).toString()
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
      const text = await res.text()
      const out = {
        requested: url,
        status: res.status,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
        body: (() => { try { return JSON.parse(text) } catch { return text } })(),
      }
      fs.writeFileSync(path.join(OUT, r.file), JSON.stringify(out, null, 2))
      console.log('[sample] Saved', r.file, res.status)
    } catch (e) {
      fs.writeFileSync(path.join(OUT, r.file), JSON.stringify({ requested: url, error: String(e) }, null, 2))
      console.warn('[sample] Error', r.file, e)
    }
  }
}

go().catch((e) => { console.error(e); process.exit(1) })
