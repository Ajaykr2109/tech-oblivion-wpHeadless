import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const issuer = 'techoblivion-fe'
const audience = 'techoblivion-user'

export type SessionClaims = {
  sub: string // WP user ID
  username: string
  email: string
  roles: string[]
}

export async function signSession(claims: SessionClaims, maxAgeSec = 60 * 60 * 24 * 7) {
  return await new SignJWT(claims as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(secret)
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret, { issuer, audience })
  return payload as unknown as SessionClaims
}
