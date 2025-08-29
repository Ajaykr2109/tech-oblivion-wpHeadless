import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/account', '/admin']

export function middleware(req: NextRequest) {
  if (!PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p))) return NextResponse.next()
  const token = req.cookies.get(process.env.SESSION_COOKIE_NAME ?? 'session')?.value
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/account/:path*', '/admin/:path*'] }
