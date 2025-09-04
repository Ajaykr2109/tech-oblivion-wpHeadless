import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'

// Mock the dependencies
jest.mock('../lib/jwt', () => ({
  verifySession: jest.fn()
}))

jest.mock('../lib/permissions', () => ({
  isEditor: jest.fn(),
  isAdmin: jest.fn()
}))

import { verifySession } from '../lib/jwt'
import { isEditor, isAdmin } from '../lib/permissions'

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>
const mockIsEditor = isEditor as jest.MockedFunction<typeof isEditor>
const mockIsAdmin = isAdmin as jest.MockedFunction<typeof isAdmin>

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (pathname: string, sessionCookie?: string) => {
    const request = new NextRequest(`http://localhost:3000${pathname}`)
    if (sessionCookie) {
      request.cookies.set('session', sessionCookie)
    }
    return request
  }

  describe('public routes', () => {
    it('allows access to public routes without authentication', async () => {
      const request = createRequest('/')
      const response = await middleware(request)
      expect(response).toBeUndefined() // No redirect
    })

    it('allows access to blog posts without authentication', async () => {
      const request = createRequest('/blog/my-post')
      const response = await middleware(request)
      expect(response).toBeUndefined()
    })
  })

  describe('editor routes', () => {
    it('redirects to login when no session exists', async () => {
      const request = createRequest('/editor')
      const response = await middleware(request)
      
      expect(response?.status).toBe(302)
      expect(response?.headers.get('location')).toBe('/login?redirect=/editor')
    })

    it('redirects to 403 when session exists but user lacks editor permissions', async () => {
      const request = createRequest('/editor', 'valid-session')
      
      mockVerifySession.mockResolvedValue({
        sub: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['subscriber']
      })
      mockIsEditor.mockReturnValue(false)

      const response = await middleware(request)
      
      expect(response?.status).toBe(302)
      expect(response?.headers.get('location')).toBe('/403')
    })

    it('allows access when user has editor permissions', async () => {
      const request = createRequest('/editor', 'valid-session')
      
      mockVerifySession.mockResolvedValue({
        sub: '2',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['editor']
      })
      mockIsEditor.mockReturnValue(true)

      const response = await middleware(request)
      expect(response).toBeUndefined() // No redirect
    })
  })

  describe('admin routes', () => {
    it('redirects to login when no session exists', async () => {
      const request = createRequest('/admin/settings')
      const response = await middleware(request)
      
      expect(response?.status).toBe(302)
      expect(response?.headers.get('location')).toBe('/login?redirect=/admin/settings')
    })

    it('redirects to 403 when user lacks admin permissions', async () => {
      const request = createRequest('/admin/settings', 'valid-session')
      
      mockVerifySession.mockResolvedValue({
        sub: '3',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['editor']
      })
      mockIsAdmin.mockReturnValue(false)

      const response = await middleware(request)
      
      expect(response?.status).toBe(302)
      expect(response?.headers.get('location')).toBe('/403')
    })

    it('allows access when user has admin permissions', async () => {
      const request = createRequest('/admin/settings', 'valid-session')
      
      mockVerifySession.mockResolvedValue({
        sub: '4',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['administrator']
      })
      mockIsAdmin.mockReturnValue(true)

      const response = await middleware(request)
      expect(response).toBeUndefined() // No redirect
    })
  })

  describe('error handling', () => {
    it('handles session verification errors by redirecting to login', async () => {
      const request = createRequest('/editor', 'invalid-session')
      
      mockVerifySession.mockRejectedValue(new Error('Invalid session'))

      const response = await middleware(request)
      
      expect(response?.status).toBe(302)
      expect(response?.headers.get('location')).toBe('/login?redirect=/editor')
    })
  })

  describe('config matcher', () => {
    it('excludes API routes from middleware', async () => {
      const request = createRequest('/api/test')
      const response = await middleware(request)
      expect(response).toBeUndefined()
    })

    it('excludes static files from middleware', async () => {
      const request = createRequest('/favicon.ico')
      const response = await middleware(request)
      expect(response).toBeUndefined()
    })
  })
})
