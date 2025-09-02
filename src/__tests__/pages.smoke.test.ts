import fs from 'fs'
import path from 'path'

const appDir = path.join(process.cwd(), 'app')

function listPageFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...listPageFiles(p))
    else if (/page\.(tsx|ts|jsx|js)$/.test(e.name)) files.push(p)
  }
  return files
}

const pages = listPageFiles(appDir)

describe('pages smoke', () => {
  for (const file of pages) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    test(`${rel} exports a component`, async () => {
      const mod = await import(file)
      const Page = mod.default ?? mod.Page ?? mod[Object.keys(mod)[0]]
      expect(typeof Page).toBe('function')
    })
  }
})
