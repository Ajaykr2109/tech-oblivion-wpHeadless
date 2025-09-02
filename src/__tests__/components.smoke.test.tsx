import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from './test-utils'; // Adjust path
import ErrorBoundary from './TestErrorBoundary'
import * as components from '@/components'; // Adjust path

// Mock data
const MOCK_USER = { display_name: 'Test User', avatar_URL: '' };
const MOCK_POST = { id: 1, title: { rendered: 'Test Post' }, slug: 'test-post', excerpt: { rendered: '' } };

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
  // For components that need props, create specific tests
  test('UserMenu renders with mock user', () => {
    const { queryByTestId } = render(<components.UserMenu user={MOCK_USER} />);
    expect(queryByTestId('error')).toBeNull();
  });

  test('PostCard renders with mock post', () => {
    const { queryByTestId } = render(<components.PostCard post={MOCK_POST} />);
    expect(queryByTestId('error')).toBeNull();
  });

  for (const file of files) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    test(`${rel} imports and renders (if component)`, async () => {
      // Use dynamic import for ES modules
      const mod = await import(file)
      const componentName = path.basename(file, path.extname(file));
      if (['UserMenu', 'PostCard'].includes(componentName)) return;
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
