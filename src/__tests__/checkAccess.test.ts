import { checkAccess } from '../lib/checkAccess'

describe('checkAccess', () => {
  test('admin role has all permissions', () => {
    expect(checkAccess('administrator', '/api/admin', 'GET', 'read')).toBe(true)
    expect(checkAccess('administrator', '/api/wp/posts', 'POST', 'write')).toBe(true)
    expect(checkAccess('administrator', '/api/wp/posts/1', 'DELETE', 'delete')).toBe(true)
  })

  test('editor role has edit and publish permissions', () => {
    expect(checkAccess('editor', '/api/wp/posts', 'POST', 'write')).toBe(true)
    expect(checkAccess('editor', '/api/analytics/summary', 'GET', 'read')).toBe(true)
    expect(checkAccess('administrator', '/api/wp/settings', 'GET', 'read')).toBe(true)
  })

  test('author role has limited permissions', () => {
    expect(checkAccess('author', '/api/wp/posts', 'POST', 'write')).toBe(true)
    expect(checkAccess('author', '/api/admin', 'GET', 'read')).toBe(false)
  })

  test('subscriber has read-only permissions', () => {
    expect(checkAccess('subscriber', '/api/wp/posts', 'GET', 'read')).toBe(true)
    expect(checkAccess('subscriber', '/api/wp/posts', 'POST', 'write')).toBe(false)
  })

  test('public has limited read permissions', () => {
    expect(checkAccess('public', '/api/wp/posts', 'GET', 'read')).toBe(true)
    expect(checkAccess('public', '/api/auth/login', 'POST', 'write')).toBe(true)
    expect(checkAccess('public', '/api/admin', 'GET', 'read')).toBe(false)
  })
})
