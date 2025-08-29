import { NextResponse } from 'next/server'
import { logWPError } from '../../../../../../src/lib/log'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'

const CACHE_DIR = path.join(process.cwd(), '.cache', 'wp-media')
const DEFAULT_TTL = Number(process.env.WP_MEDIA_CACHE_TTL || '86400') // seconds (1 day)

// parse per-extension TTL overrides from env like: 
// WP_MEDIA_TTL_EXT='.png=86400,.jpg=43200,.woff2=259200'
const TTL_EXT_RAW = process.env.WP_MEDIA_TTL_EXT || ''
const TTL_BY_EXT: Record<string, number> = {}
if (TTL_EXT_RAW) {
  TTL_EXT_RAW.split(',').forEach(pair => {
    const [k, v] = pair.split('=')
    if (k && v) {
      const ext = k.trim().replace(/^\./, '').toLowerCase()
      const n = Number(v.trim())
      if (!isNaN(n) && ext) TTL_BY_EXT[ext] = n
    }
  })
}

// simple in-memory metrics (process-local)
const metrics = { hits: 0, misses: 0 }
let lastPersisted = 0
async function persistMetrics() {
  try {
    const mpath = path.join(CACHE_DIR, 'metrics.json')
    await fsPromises.writeFile(mpath, JSON.stringify(metrics), 'utf-8')
    lastPersisted = Date.now()
  } catch (e) {
    // ignore
  }
}

async function ensureCacheDir() {
  try {
    await fsPromises.mkdir(CACHE_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

function filenameFor(urlStr: string) {
  try {
  // If it's an absolute URL, keep hostname+pathname to reduce collisions across hosts
  const u = new URL(urlStr)
  const ext = path.extname(u.pathname) || ''
  const key = Buffer.from(u.hostname + u.pathname + u.search).toString('base64').replace(/=+$/, '')
  return `${key}${ext}`
  } catch (e) {
    const key = Buffer.from(urlStr).toString('base64').replace(/=+$/, '')
    return key
  }
}

async function readMeta(metaPath: string) {
  try {
    const raw = await fsPromises.readFile(metaPath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) {
    return NextResponse.json({ error: 'WP_URL not configured' }, { status: 500 })
  }

  const upstreamPath = params.path.join('/')
  // Support encoded absolute upstream URLs under the prefix: /api/wp/media/absolute/{encodeURIComponent(url)}
  let upstreamUrl = ''
  if (upstreamPath.startsWith('absolute/')) {
    const encoded = upstreamPath.replace(/^absolute\//, '')
    try {
      upstreamUrl = decodeURIComponent(encoded)
    } catch (e) {
      upstreamUrl = encoded
    }
  } else {
    upstreamUrl = new URL(upstreamPath, WP).toString()
  }

  await ensureCacheDir()

  const fname = filenameFor(upstreamUrl)
  const filePath = path.join(CACHE_DIR, fname)
  const metaPath = `${filePath}.meta.json`

  // Serve cached file when fresh
  try {
    const stat = await fsPromises.stat(filePath).catch(() => null)
    if (stat) {
      const meta = await readMeta(metaPath)
      // compute TTL using meta override or per-extension override
      let ttl = (meta?.ttl_seconds as number) ?? DEFAULT_TTL
      const ext = path.extname(filePath).replace(/^\./, '').toLowerCase()
      if (ext && TTL_BY_EXT[ext]) ttl = TTL_BY_EXT[ext]
      const age = (Date.now() - stat.mtimeMs) / 1000
      if (age < ttl) {
  metrics.hits += 1
  persistMetrics().catch(() => null)
        const headers = new Headers()
        if (meta?.contentType) headers.set('Content-Type', meta.contentType)
        headers.set('Cache-Control', meta?.cacheControl || `public, max-age=${ttl}`)
        headers.set('X-Cache-Status', 'HIT')
        headers.set('X-Cache-Hits', String(metrics.hits))
        const nodeStream = fs.createReadStream(filePath)
        // convert to Web ReadableStream for Next
        const webStream = Readable.toWeb(nodeStream)
        return new NextResponse(webStream as any, { status: 200, headers })
      }
      // otherwise revalidate upstream
    }
  } catch (e) {
    // ignore cache read errors
  }

  // Fetch upstream and cache
  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)',
        'Referer': WP,
        'Accept': '*/*',
      },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logWPError('media-proxy', { status: res.status, statusText: res.statusText, body })
      // Return a small placeholder PNG instead of raw HTML so the browser doesn't treat
      // the response as an image failure. This keeps the UI stable while upstream is down.
      const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAr8B9oYkqgAAAABJRU5ErkJggg==', 'base64')
      const headers = new Headers()
      headers.set('Content-Type', 'image/png')
      headers.set('Cache-Control', `public, max-age=${DEFAULT_TTL}`)
      headers.set('X-Cache-Status', 'MISS')
      return new NextResponse(placeholder, { status: 200, headers })
    }

  const contentType = res.headers.get('content-type') || undefined
  // If upstream returned HTML (some security plugins return HTML pages), return placeholder
  if (contentType && /text\/(html|plain)/i.test(contentType)) {
    const body = await res.text().catch(() => '')
    logWPError('media-proxy-html', { status: res.status, statusText: res.statusText, body: body.slice(0, 2000) })
    const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAr8B9oYkqgAAAABJRU5ErkJggg==', 'base64')
    const headers = new Headers()
    headers.set('Content-Type', 'image/png')
    headers.set('Cache-Control', `public, max-age=${DEFAULT_TTL}`)
    headers.set('X-Cache-Status', 'MISS')
    return new NextResponse(placeholder, { status: 200, headers })
  }
  const isStatic = !!(contentType && /(image|font|audio|video|application\/octet-stream|font\/woff|font\/woff2)/i.test(contentType))
  // pick base TTL and allow per-ext override
  const ext = path.extname(upstreamUrl).replace(/^\./, '').toLowerCase()
  const baseTtl = isStatic ? DEFAULT_TTL : 3600
  const ttlForThis = (ext && TTL_BY_EXT[ext]) ? TTL_BY_EXT[ext] : baseTtl
  const cacheControl = res.headers.get('cache-control') || `public, max-age=${ttlForThis}`

  const meta = { contentType, cacheControl, ttl_seconds: ttlForThis }

    // Write to temp file and persist async
    const tmpPath = `${filePath}.${Date.now()}.tmp`
  try {
      const nodeBody: any = (res as any).body
      if (nodeBody && typeof nodeBody.pipe === 'function') {
        const ws = fs.createWriteStream(tmpPath)
        nodeBody.pipe(ws)
        ws.on('close', async () => {
          try {
            await fsPromises.writeFile(metaPath, JSON.stringify(meta), 'utf-8')
            await fsPromises.rename(tmpPath, filePath).catch(async () => {
              await fsPromises.copyFile(tmpPath, filePath).catch(() => null)
              await fsPromises.unlink(tmpPath).catch(() => null)
            })
          } catch (e) {
            // ignore cache write errors
          }
        })
  metrics.misses += 1
  persistMetrics().catch(() => null)
      } else {
        const arr = await res.arrayBuffer()
        await fsPromises.writeFile(filePath, Buffer.from(arr))
        await fsPromises.writeFile(metaPath, JSON.stringify(meta), 'utf-8')
      }
    } catch (e) {
      // ignore cache write issues
    }

    const headers = new Headers()
    if (contentType) headers.set('Content-Type', contentType)
    headers.set('Cache-Control', cacheControl)

    return new NextResponse(res.body, { status: 200, headers })
  } catch (err: any) {
    logWPError('media-proxy-exception', { statusText: String(err), body: undefined })
    return NextResponse.json({ error: 'upstream fetch failed' }, { status: 502 })
  }
}
