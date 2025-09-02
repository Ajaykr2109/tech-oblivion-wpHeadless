import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|bmp|tiff)$': '<rootDir>/src/__tests__/fileMock.js',
    '^next/image$': '<rootDir>/src/__tests__/nextImageMock.js',
  '^next/navigation$': '<rootDir>/src/__tests__/nextNavigationMock.js',
  '^next/headers$': '<rootDir>/src/__tests__/nextNavigationMock.js',
  '^next/server$': '<rootDir>/src/__tests__/nextServerMock.js',
  '^next/cache$': '<rootDir>/src/__tests__/nextServerMock.js',
  '^server-only$': '<rootDir>/src/__tests__/serverOnlyMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react|d3-scale|jose|react-markdown|unified|remark-parse|github-slugger|react-dnd|dnd-core|@react-dnd|unist-util-visit|is-plain-obj|@radix-ui)/',
  ],
}

export default createJestConfig(customJestConfig)
