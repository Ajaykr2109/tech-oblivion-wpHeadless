export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return new Response(JSON.stringify({ message: 'Not implemented' }), { status: 501 })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Not implemented' }), { status: 501 })
}
