import fs from 'fs'
import path from 'path'

const libDir = path.join(process.cwd(), 'src', 'lib')

function listLibFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue
      files.push(...listLibFiles(p))
    } else if (/\.(tsx|ts|js|jsx)$/.test(e.name)) files.push(p)
  }
  return files
}

const files = listLibFiles(libDir)

describe('lib smoke', () => {
  for (const file of files) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    test(`${rel} imports`, () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(file)
      expect(mod).toBeTruthy()
    })
  }
})
