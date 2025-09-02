import fs from 'fs'
import path from 'path'

const apiDir = path.join(process.cwd(), 'app', 'api')

function listRouteFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...listRouteFiles(p))
    else if (/route\.(tsx|ts|jsx|js)$/.test(e.name)) files.push(p)
  }
  return files
}

const routes = listRouteFiles(apiDir)

describe('api routes smoke', () => {
  for (const file of routes) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    test(`${rel} exports handlers`, async () => {
      // Use dynamic import for ES modules
      const mod = await import(file)
      expect(mod && Object.keys(mod).length >= 1).toBeTruthy()
    })
  }
})
