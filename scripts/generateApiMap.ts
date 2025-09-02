import fs from 'node:fs'
import path from 'node:path'

import { apiMap as loadedApiMap, WP_BASE } from '../src/lib/wpAPIMap'

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
  // re-exports
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

type ApiMap = Record<string, unknown>

function getValueFromApiMap(obj: ApiMap, chain: string[]): unknown {
  let cur: unknown = obj
  for (const key of chain) {
    if (cur && typeof cur === 'object' && cur !== null && key in cur) {
      cur = (cur as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return cur
}

function normalizeWP(val: string): string {
  const base = (WP_BASE || '').replace(/\/$/, '')
  return val.replace(base, '{WP}')
}

function extractTargets(src: string): string[] {
  const targets = new Set<string>()
  // direct apiMap usage, e.g., apiMap.analytics.views
  const directRe = /apiMap\.(\w+)\.(\w+)/g
  let m: RegExpExecArray | null
  while ((m = directRe.exec(src))) {
    const section = m[1]
    const key = m[2]
    const val = getValueFromApiMap(loadedApiMap, [section, key])
    if (typeof val === 'string') targets.add(normalizeWP(val))
  }
  // destructured usage: const { analytics } = apiMap; then analytics.views
  const destructured: string[] = []
  const destrRe = /const\s*\{\s*([^}]+)\s*}\s*=\s*apiMap/g
  while ((m = destrRe.exec(src))) {
    const names = (m[1] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    destructured.push(...names)
  }
  for (const alias of destructured) {
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
  // string literal fetch to WP_BASE concatenations
  const literalRe = /['"](https?:[^'"]*wp-json[^'"]+)['"]/g
  while ((m = literalRe.exec(src))) {
    targets.add(normalizeWP(m[1]))
  }
  return Array.from(targets)
}

function buildTable(rows: RouteInfo[]): string {
  const header = ['Endpoint', 'Methods', 'Upstream WP Endpoint(s)']
  const sep = ['---', '---', '---']
  const body = rows
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((r) => `| \`${r.path}\` | ${r.methods.join(', ')} | ${r.targets.length ? r.targets.map((t) => `\`${t}\``).join('<br/>') : '_n/a_'} |`)
  return [
    '# API Proxy Map (generated)',
    '<!-- markdownlint-disable MD033 -->',
    '',
    '> Do not edit manually. Generated from app/api and src/app/api by scripts/generateApiMap.ts',
    '',
    `| ${header.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...body,
    '',
    '_Note: This is best-effort static analysis. Dynamic endpoints or function-based apiMap entries may not be fully resolved._',
    '<!-- markdownlint-enable MD033 -->',
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
  const outPath = path.resolve(process.cwd(), 'docs', 'api-reference', 'proxy-map.md')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, md, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`)
}

main()
