export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Basic audit log stub: in real impl, persist to DB
  try {
    const payload = await req.json().catch(() => ({}))
    // eslint-disable-next-line no-console
    console.log('AUDIT_LOG', JSON.stringify(payload))
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
