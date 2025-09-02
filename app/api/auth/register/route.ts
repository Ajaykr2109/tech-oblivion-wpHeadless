import { NextResponse } from 'next/server'
import { z } from 'zod'

import { wpFetch } from '../../../../src/lib/fetcher'
import { logWPError } from '../../../../src/lib/log'
import { CSRF_COOKIE } from '../../../../src/lib/csrf'

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(6), username: z.string().optional() })

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  // same-origin only
  if (origin && origin !== process.env.NEXT_PUBLIC_SITE_URL) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const headerCsrf = req.headers.get('x-csrf-token') || undefined
  const cookie = req.headers.get('cookie') || ''
  // simple double-submit check
  if (!cookie.includes(`${CSRF_COOKIE}=`) || !headerCsrf) return NextResponse.json({ message: 'Invalid CSRF' }, { status: 403 })

  const payload: unknown = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input', details: parsed.error.format() }, { status: 400 })

  try {
    const res = await wpFetch('/wp-json/fe-auth/v1/register', { method: 'POST', body: parsed.data })
    return NextResponse.json(res, { status: 201 })
  } catch (err: unknown) {
    // log WP errors for diagnostics
    const error = err as { status?: number; message?: string; details?: unknown }
    const status = (typeof error === 'object' && error && 'status' in error && typeof error.status === 'number') ? error.status : 500
    const message = (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') ? error.message : 'Error'
    const details = (typeof error === 'object' && error && 'details' in error) ? error.details : err
    logWPError('register', { status, statusText: message, body: typeof details === 'string' ? details.slice(0, 2000) : JSON.stringify(details || '').slice(0, 2000) })
    return NextResponse.json({ message, details }, { status })
  }
}
