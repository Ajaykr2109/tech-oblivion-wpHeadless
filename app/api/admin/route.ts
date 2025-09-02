import { NextResponse } from 'next/server'

import { requireRole } from '../../../src/lib/auth'

export async function GET() {
  try {
    await requireRole('administrator')
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Forbidden'
    return NextResponse.json({ message }, { status: 403 })
  }
}
