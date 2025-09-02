import { checkAccess } from '../lib/checkAccess'

describe('simplified checkAccess', () => {
  test('admin role has all actions', () => {
    expect(checkAccess('administrator', '/api/admin', 'GET', 'read')).toBe(true)
  })

  test('editor can edit and publish', () => {
    expect(checkAccess('editor', '/api/wp/posts', 'POST', 'write')).toBe(true)
  })

  test('viewer has limited access', () => {
    expect(checkAccess('subscriber', '/api/wp/posts', 'GET', 'read')).toBe(true)
    expect(checkAccess('subscriber', '/api/wp/posts', 'POST', 'write')).toBe(false)
  })

  test('guest has minimal access', () => {
    expect(checkAccess('public', '/api/wp/posts', 'GET', 'read')).toBe(true)
    expect(checkAccess('public', '/api/admin', 'GET', 'read')).toBe(false)
  })
})
