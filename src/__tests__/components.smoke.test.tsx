import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from '@testing-library/react'
import ErrorBoundary from './TestErrorBoundary'

const componentsDir = path.join(process.cwd(), 'src', 'components')

function listTsxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    if (e.name.startsWith('_') || e.name.endsWith('.d.ts')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...listTsxFiles(p))
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) files.push(p)
  }
  return files
}

const files = fs.existsSync(componentsDir) ? listTsxFiles(componentsDir) : []

describe('components smoke', () => {
  for (const file of files) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    test(`${rel} imports and renders (if component)`, () => {
      // Use require to leverage Jest transformers for TS/TSX
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(file)
      const C = mod.default ?? mod.Component ?? mod[Object.keys(mod)[0]]
      if (typeof C === 'function') {
        // Try render with no props
        const { queryByTestId } = render(
          <ErrorBoundary>
            {React.createElement(C as any)}
          </ErrorBoundary>
        )
        expect(queryByTestId('error')).toBeNull()
      } else {
        expect(mod).toBeTruthy()
      }
    })
  }
})
