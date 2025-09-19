export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    return Response.json({ ok: true, received: body })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
