import { NextResponse } from 'next/server'
import { requireRole } from '../../../src/lib/auth'

export async function GET() {
  try {
    await requireRole('administrator')
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Forbidden' }, { status: err.status ?? 403 })
  }
}
