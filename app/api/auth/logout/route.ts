// cookies import removed (unused)

export async function POST(req: Request) {
  const xfProto = req.headers.get('x-forwarded-proto')
  const isHttps = (xfProto ? xfProto.split(',')[0].trim() : '') === 'https' || new URL(req.url).protocol === 'https:'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=; Path=/; Max-Age=0; SameSite=Lax; ${isHttps ? 'Secure; ' : ''}HttpOnly`
  return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie } })
}

export async function GET(req: Request) {
  const xfProto = req.headers.get('x-forwarded-proto')
  const isHttps = (xfProto ? xfProto.split(',')[0].trim() : '') === 'https' || new URL(req.url).protocol === 'https:'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=; Path=/; Max-Age=0; SameSite=Lax; ${isHttps ? 'Secure; ' : ''}HttpOnly`
  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect') || '/'
  return new Response(null, { status: 302, headers: { 'Set-Cookie': cookie, Location: redirect } })
}
