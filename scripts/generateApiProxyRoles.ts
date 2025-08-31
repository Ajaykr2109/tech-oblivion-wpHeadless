import fs from 'node:fs'
import path from 'node:path'
import { apiMap as loadedApiMap, WP_BASE } from '../src/lib/wpAPIMap'
import { apiRolesMatrix, type Role } from '../src/config/apiRolesMatrix'

type Methods = string[]
type RouteInfo = { path: string; methods: Methods; targets: string[] }

const API_DIRS = [
  path.resolve(process.cwd(), 'app', 'api'),
  path.resolve(process.cwd(), 'src', 'app', 'api'),
]

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, acc)
    else if (entry.isFile() && entry.name === 'route.ts') acc.push(p)
  }
  return acc
}

function detectMethods(src: string): Methods {
  const methods = new Set<string>()
  const re = /export\s+(?:async\s+)?function\s+(GET|POST|PATCH|PUT|DELETE)|export\s+const\s+(GET|POST|PATCH|PUT|DELETE)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    const method = (m[1] || m[2])?.toUpperCase()
    if (method) methods.add(method)
  }
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
  const isSrc = absFile.includes(`${path.sep}src${path.sep}app${path.sep}`)
  const appRoot = isSrc ? path.resolve(process.cwd(), 'src', 'app') : path.resolve(process.cwd(), 'app')
  const rel = path.relative(appRoot, absFile).replace(/\\/g, '/')
  return '/' + rel.replace(/\/route\.ts$/, '')
}

type ApiMap = any

function getValueFromApiMap(obj: ApiMap, chain: string[]): unknown {
  let cur: any = obj
  for (const key of chain) {
    if (cur && typeof cur === 'object' && key in cur) cur = cur[key]
    else return undefined
  }
  return cur
}

function normalizeWP(val: string): string {
  const base = (WP_BASE || '').replace(/\/$/, '')
  return val.replace(base, '{WP}')
}

function extractTargets(src: string): string[] {
  const targets = new Set<string>()
  // apiMap.section.key
  const directRe = /apiMap\.(\w+)\.(\w+)/g
  let m: RegExpExecArray | null
  while ((m = directRe.exec(src))) {
    const val = getValueFromApiMap(loadedApiMap, [m[1], m[2]])
    if (typeof val === 'string') targets.add(normalizeWP(val))
  }
  // const { analytics } = apiMap; analytics.views
  const destr: string[] = []
  const destrRe = /const\s*\{\s*([^}]+)\s*}\s*=\s*apiMap/g
  while ((m = destrRe.exec(src))) {
    destr.push(
      ...((m[1] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)),
    )
  }
  for (const alias of destr) {
    const aliasRe = new RegExp(`${alias}\\.(\\w+)`, 'g')
    let mm: RegExpExecArray | null
    while ((mm = aliasRe.exec(src))) {
      const key = mm[1]
      const val = getValueFromApiMap(loadedApiMap, [alias, key])
      if (typeof val === 'string') targets.add(normalizeWP(val))
    }
  }
  // new URL('/wp-json/...', WP)
  const newUrlRe = /new\s+URL\(\s*['"](\/wp-json[^'"]+)['"]/g
  while ((m = newUrlRe.exec(src))) {
    const pathOnly = m[1]
    if (pathOnly) targets.add(`{WP}${pathOnly}`)
  }
  // literal wp-json URLs
  const literalRe = /['"](https?:[^'"]*wp-json[^'"]+)['"]/g
  while ((m = literalRe.exec(src))) {
    targets.add(normalizeWP(m[1]))
  }
  return Array.from(targets)
}

const roles: Role[] = [
  'public',
  'subscriber',
  'contributor',
  'author',
  'editor',
  'seo_editor',
  'seo_manager',
  'administrator',
]

function markAccess(endpointPath: string, method: string): Record<Role, boolean> {
  // Try exact and then pattern match like in audit script
  const methodUpper = method.toUpperCase()
  const match = apiRolesMatrix.find((e) => {
    if (e.method !== (methodUpper as any)) return false
    if (e.path === endpointPath) return true
    const pattern = e.path
      .replace(/\//g, '\\/')
      .replace(/\[.+?\]/g, '[^/]+')
      .replace(/\.+/g, '.+')
    return new RegExp(`^${pattern}$`).test(endpointPath)
  })
  const out = Object.create(null) as Record<Role, boolean>
  for (const r of roles) out[r] = match ? Boolean(match.roles[r]?.length) : false
  return out
}

function headerForRole(r: Role) {
  if (r === 'seo_editor') return 'SEO Editor'
  if (r === 'seo_manager') return 'SEO Manager'
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function buildTable(rows: RouteInfo[]): string {
  const baseHeader = ['Endpoint', 'Methods', 'Upstream WP Endpoint(s)']
  const roleHeader = roles.map(headerForRole)
  const header = [...baseHeader, ...roleHeader]
  const sep = header.map(() => '---')

  const body = rows
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((r) => {
      const firstMethod = r.methods[0] || 'GET'
      const allowed = markAccess(r.path, firstMethod)
      const accessMarks = roles.map((role) => (allowed[role] ? '✅' : '❌'))
      return `| \`${r.path}\` | ${r.methods.join(', ')} | ${r.targets.length ? r.targets.map((t) => `\`${t}\``).join('<br/>') : '_n/a_'} | ${accessMarks.join(' | ')} |`
    })

  return [
    '# API Proxy Map with Roles (generated)',
    '',
    '> Do not edit manually. Generated from app/api and src/app/api and joined with src/config/apiRolesMatrix.ts',
    '',
    `| ${header.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...body,
    '',
    '_Note: Role marks use the first detected method for the route; for routes supporting multiple methods, consult api-roles-matrix.md for per-method details._',
  ].join('\n')
}

function main() {
  const files = API_DIRS.flatMap((d) => walk(d))
  const rows: RouteInfo[] = []
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8')
    const methods = detectMethods(src)
    const targets = extractTargets(src)
    rows.push({ path: toApiPath(file), methods: methods.length ? methods : ['GET'], targets })
  }
  const md = buildTable(rows)
  const outPath = path.resolve(process.cwd(), 'docs', 'api-proxy-map-with-roles.md')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, md, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`)
}

main()
