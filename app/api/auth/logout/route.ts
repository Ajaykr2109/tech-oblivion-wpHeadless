// cookies import removed (unused)

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=; Path=/; Max-Age=0; SameSite=Lax; ${isProd ? 'Secure; ' : ''}HttpOnly`
  return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie } })
}
