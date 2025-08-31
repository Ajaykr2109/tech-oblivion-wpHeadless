import fs from 'node:fs'
import path from 'node:path'
import { apiRolesMatrix } from '../src/config/apiRolesMatrix'

const API_DIRS = [
  path.resolve(process.cwd(), 'app', 'api'),
  path.resolve(process.cwd(), 'src', 'app', 'api'),
]

type RouteDef = { method: string; path: string }
type FileInfo = { absPath: string; path: string; methods: string[]; root: 'app' | 'src' }

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, acc)
    else if (entry.isFile() && entry.name === 'route.ts') acc.push(p)
  }
  return acc
}

function detectMethods(filePath: string): string[] {
  const src = fs.readFileSync(filePath, 'utf8')
  const methods = new Set<string>()
  // Support standard Next.js export const GET/POST/etc patterns
  const re = /export\s+(?:async\s+)?function\s+(GET|POST|PATCH|PUT|DELETE)|export\s+const\s+(GET|POST|PATCH|PUT|DELETE)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    const method = (m[1] || m[2])?.toUpperCase()
    if (method) methods.add(method)
  }
  // Detect named re-exports: export { GET, POST } from '...'
  const reExport = /export\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"]/g
  while ((m = reExport.exec(src))) {
    const names = (m[1] || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((n) => ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(n))
    for (const n of names) methods.add(n)
  }
  return Array.from(methods)
}

function toApiPath(absFile: string): string {
  const appRoot = absFile.includes(`${path.sep}src${path.sep}app${path.sep}`)
    ? path.resolve(process.cwd(), 'src', 'app')
    : path.resolve(process.cwd(), 'app')
  const rel = path.relative(appRoot, absFile).replace(/\\/g, '/')
  // drop trailing "/route.ts"
  const base = rel.replace(/\/route\.ts$/, '')
  // convert folder segments to URL
  return '/' + base
}

function main() {
  const files = API_DIRS.flatMap((d) => walk(d))
  const byPath = new Map<string, FileInfo[]>()
  for (const f of files) {
    const apiPath = toApiPath(f)
    const methods = detectMethods(f)
    const root: 'app' | 'src' = f.includes(`${path.sep}src${path.sep}app${path.sep}`) ? 'src' : 'app'
    const list = byPath.get(apiPath) || []
    list.push({ absPath: f, path: apiPath, methods, root })
    byPath.set(apiPath, list)
  }

  const selected: FileInfo[] = []
  for (const [apiPath, infos] of byPath) {
    if (infos.length === 1) {
      selected.push(infos[0])
    } else {
      // prefer the one with more explicitly detected methods; tie-breaker: prefer app/
      const sorted = [...infos].sort((a, b) => {
        if (b.methods.length !== a.methods.length) return b.methods.length - a.methods.length
        if (a.root !== b.root) return a.root === 'app' ? -1 : 1
        return a.absPath.localeCompare(b.absPath)
      })
      selected.push(sorted[0])
    }
  }

  const missing: RouteDef[] = []
  for (const info of selected) {
    // Skip files with no detectable methods (likely pure re-export placeholders or disabled files)
    if (info.methods.length === 0) continue
    for (const method of info.methods) {
      const matched = apiRolesMatrix.some((e) => {
        if (e.method !== (method as any)) return false
        const pattern = e.path
          .replace(/\//g, '\\/')
          .replace(/\[.+?\]/g, '[^/]+')
          .replace(/\.+/g, '.+')
        const re = new RegExp(`^${pattern}$`)
        return re.test(info.path)
      })
      if (!matched) missing.push({ method, path: info.path })
    }
  }

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn('RBAC AUDIT: Missing mappings for the following routes:')
    for (const r of missing) {
      // eslint-disable-next-line no-console
      console.warn(` - ${r.method} ${r.path}`)
    }
    process.exitCode = 1
  } else {
    // eslint-disable-next-line no-console
    console.log('RBAC AUDIT: All routes are covered by apiRolesMatrix.')
  }
}

main()
