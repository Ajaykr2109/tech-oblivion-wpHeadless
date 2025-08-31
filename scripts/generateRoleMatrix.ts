import fs from 'node:fs'
import path from 'node:path'
import { apiRolesMatrix, type Role } from '../src/config/apiRolesMatrix'

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

function allowedMark(has: boolean) {
  return has ? '✅' : '❌'
}

function roleHeader(role: Role) {
  switch (role) {
    case 'seo_editor':
      return 'SEO Editor'
    case 'seo_manager':
      return 'SEO Manager'
    default:
      return role.charAt(0).toUpperCase() + role.slice(1)
  }
}

function buildTable() {
  const header = ['Endpoint', 'Method', ...roles.map(roleHeader)]
  const sep = header.map(() => '---')

  const rows = apiRolesMatrix.map((e) => {
    const cols: string[] = []
    cols.push(`\`${e.path}\``)
    cols.push(e.method)
    for (const r of roles) {
      const actions = e.roles[r]
      const has = Array.isArray(actions) && actions.length > 0
      cols.push(allowedMark(has))
    }
    return `| ${cols.join(' | ')} |`
  })

  const out = [
    '<!-- markdownlint-disable MD036 -->',
    '# API Roles Matrix (generated)',
    '',
    'Do not edit manually. Source of truth: `src/config/apiRolesMatrix.ts`.',
    '',
    `| ${header.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...rows,
    '',
    'Legend: ✅ allowed (any of read/write/delete/moderate), ❌ disallowed.',
    '<!-- markdownlint-enable MD036 -->',
  ].join('\n')

  return out
}

function main() {
  const md = buildTable()
  const docsDir = path.resolve(process.cwd(), 'docs', 'api-reference')
  const target = path.join(docsDir, 'roles-matrix.md')
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(target, md, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Wrote ${target}`)
}

main()
