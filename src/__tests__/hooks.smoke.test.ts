import fs from 'fs'
import path from 'path'

const hooksDir = path.join(process.cwd(), 'src', 'hooks')

function listHookFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...listHookFiles(p))
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p)
  }
  return files
}

const files = listHookFiles(hooksDir)

describe('hooks smoke', () => {
  for (const file of files) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    test(`${rel} compiles`, () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(file)
      const fn = mod.default ?? mod[Object.keys(mod)[0]]
      expect(typeof fn === 'function' || typeof mod === 'object').toBeTruthy()
    })
  }
})
