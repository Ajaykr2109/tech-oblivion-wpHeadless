// Debug endpoint to check cookie and environment settings
export async function GET(req: Request) {
  const url = new URL(req.url)
  const xfProto = req.headers.get('x-forwarded-proto')
  const isHttps = (xfProto ? xfProto.split(',')[0].trim() : '') === 'https' || url.protocol === 'https:'
  
  return new Response(JSON.stringify({
    url: url.toString(),
    protocol: url.protocol,
    host: url.host,
    xForwardedProto: xfProto,
    isHttpsDetected: isHttps,
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'session',
    environment: process.env.NODE_ENV,
    wpUrl: process.env.WP_URL,
    cookieHeader: req.headers.get('cookie'),
    userAgent: req.headers.get('user-agent')
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}