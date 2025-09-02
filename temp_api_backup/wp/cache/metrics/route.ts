import path from 'path'

import { NextResponse } from 'next/server'

// lightweight, process-local metrics reflected from media proxy
// Note: metrics are process-local; in multi-instance deployments, aggregate externally.
const metricsFile = path.join(process.cwd(), '.cache', 'wp-media', 'metrics.json')

export async function GET() {
  // try to read persisted metrics if available
  try {
    const raw = await import('fs/promises').then(m => m.readFile(metricsFile, 'utf-8')).catch(() => null)
    if (raw) return NextResponse.json(JSON.parse(raw))
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true, message: 'metrics not persisted; check logs or use headers' })
}
