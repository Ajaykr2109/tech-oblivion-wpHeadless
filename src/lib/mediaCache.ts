import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const CACHE_DIR = path.join(PUBLIC_DIR, 'media-cache')

function sha1(input: string) {
  return crypto.createHash('sha1').update(input).digest('hex')
}

function extFromContentType(ct?: string | null, fallbackUrl?: string) {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
  }
  const t = (ct || '').toLowerCase()
  if (map[t]) return map[t]
  // try from URL suffix
  try {
    const u = new URL(fallbackUrl || '')
    const m = u.pathname.match(/\.([a-zA-Z0-9]+)$/)
    if (m) return m[1].toLowerCase()
  } catch {}
  return 'img'
}

export async function cacheImage(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) throw new Error('Only absolute http(s) URLs allowed')
  await fs.mkdir(CACHE_DIR, { recursive: true })
  const key = sha1(url)
  // We'll store original ext if determinable; otherwise choose from content-type later
  let dest = ''
  // If any file exists with this key and any ext, return it
  const existing = await findExisting(key)
  if (existing) return `/media-cache/${existing}`

  const headers: Record<string, string> = {
    Accept: 'image/*,*/*;q=0.8',
    'User-Agent': 'techoblivion-media-cache/1.0',
  }
  try {
    const WP = process.env.WP_URL
    if (WP) {
      try {
        const wpHost = new URL(WP).host
        const u = new URL(url)
        if (u.host === wpHost) headers['Referer'] = WP
      } catch {}
    }
  } catch {}

  const res = await fetch(url, { cache: 'no-store', headers })
  if (!res.ok) throw new Error(`Upstream ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.toLowerCase().startsWith('image/')) throw new Error(`Bad content-type ${ct}`)

  const ab = await res.arrayBuffer()
  const ext = extFromContentType(ct, url)
  const filename = `${key}.${ext}`
  dest = path.join(CACHE_DIR, filename)
  await fs.writeFile(dest, Buffer.from(ab))
  return `/media-cache/${filename}`
}

async function findExisting(key: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(CACHE_DIR)
    const found = entries.find((f) => f.startsWith(key + '.'))
    return found || null
  } catch {
    return null
  }
}
