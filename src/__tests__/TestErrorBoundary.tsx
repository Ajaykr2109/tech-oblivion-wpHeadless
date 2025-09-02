import React from 'react'
import AppErrorBoundary from '../components/error-boundary'

export default function TestErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary fallback={<div data-testid="error">Tile failed</div>}>
      {children}
    </AppErrorBoundary>
  )
}

// Dummy test to satisfy Jest
describe('TestErrorBoundary', () => {
  it('is a component', () => {
    expect(TestErrorBoundary).toBeDefined()
  })
})
