// src/lib/wpProxy.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signProxy(method: string, path: string, body: any) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const raw = body != null ? JSON.stringify(body) : '';
  const msg = `${method.toUpperCase()}\n${path}\n${ts}\n${raw}`;
  const secret = process.env.FE_PROXY_SECRET!;
  const crypto = await import('crypto');
  const sig = crypto.createHmac('sha256', secret).update(msg).digest('base64');
  return { ts, sig, raw };
}
