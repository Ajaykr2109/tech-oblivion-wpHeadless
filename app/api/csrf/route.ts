import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { CSRF_COOKIE, generateCsrfToken } from '../../../src/lib/csrf'

export async function GET() {
  const store = await cookies()
  const existing = store.get?.(CSRF_COOKIE) as { value: string } | undefined
  if (existing?.value) {
    return NextResponse.json({ token: existing.value }, { status: 200 })
  }
  const token = generateCsrfToken()
  const res = NextResponse.json({ token }, { status: 200 })
  res.headers.append('Set-Cookie', `${CSRF_COOKIE}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`)
  return res
}
