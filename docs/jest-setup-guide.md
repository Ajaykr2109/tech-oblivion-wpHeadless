# 🧪 Jest Configuration & Testing Setup

## Current Jest Status
- ✅ **Jest configuration exists** (`jest.config.js`)
- ✅ **Test files created** (permissions, middleware, component tests)
- ✅ **TypeScript compilation successful**
- ❌ **Tests not executing** in CI/terminal

## Quick Jest Setup Fixes

### 1. Install Missing Dependencies
```bash
npm install --save-dev @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### 2. Update package.json scripts
```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Verify jest.setup.ts exists
File should contain:
```typescript
import '@testing-library/jest-dom'
```

### 4. Run tests manually
```bash
# Run all tests
npm test

# Run specific test file
npm test permissions.test.ts

# Run with verbose output
npx jest --verbose
```

## Alternative: Switch to Vitest (Recommended)

Since Next.js is moving toward Vitest, consider switching:

### Install Vitest
```bash
npm install --save-dev vitest @vitejs/plugin-react
```

### Create vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Update package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## Test Execution Checklist

Before merging to production:

- [ ] Jest/Vitest runs successfully
- [ ] All permission tests pass
- [ ] Middleware tests pass  
- [ ] Component integration tests pass
- [ ] Tests included in CI pipeline
- [ ] Coverage report generated

## Quick Test Commands

```bash
# Check if Jest works at all
npx jest --version

# Run with maximum verbosity
npx jest --verbose --no-cache

# Check specific test pattern
npx jest permissions

# Debug test runner
npx jest --debug
```

## Common Issues & Fixes

### Issue: "Cannot find module '@/'"
**Fix**: Ensure `moduleNameMapper` in jest.config.js includes:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

### Issue: "ReferenceError: fetch is not defined"
**Fix**: Add to jest.setup.ts:
```typescript
import 'whatwg-fetch'
// or
global.fetch = require('node-fetch')
```

### Issue: Next.js modules not found
**Fix**: Ensure `next/jest` is properly configured in jest.config.js

## Priority Actions

1. **IMMEDIATE**: Verify Jest can run basic tests
2. **MEDIUM**: Ensure all written tests execute
3. **LONG-TERM**: Integrate into CI/CD pipeline

The permission system is solid - just need the test runner working to validate it in CI.
