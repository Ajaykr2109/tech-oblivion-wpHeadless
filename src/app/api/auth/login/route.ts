import { z } from 'zod'

import { signSession } from '@/lib/jwt'
import { logWPError } from '@/lib/log'
import { validateCsrf, validateCsrfFromRequest } from '@/lib/csrf'

const schema = z.object({ identifier: z.string().min(1), password: z.string().min(1) })

export async function POST(req: Request) {
	const csrfHeader = req.headers.get('x-csrf-token') || undefined
	const ok = validateCsrf(csrfHeader) || validateCsrfFromRequest(req, csrfHeader)
	if (!ok) {
		console.warn('CSRF validation failed', {
			hasHeader: Boolean(csrfHeader),
			hasCookieHeader: Boolean(req.headers.get('cookie')),
		})
		return new Response(JSON.stringify({ error: 'Invalid CSRF' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
	}
	const body: unknown = await req.json()
	const { identifier, password } = schema.parse(body)
	let data: {
		token: string;
		user_email: string;
		user_nicename: string;
		user_display_name: string;
		user_id?: number;
	}

	try {
		const wpUrl = process.env.WP_URL || 'http://example.com'
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), 10000)
		const response = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'tech-oblivion-fe/1.0',
			},
			body: JSON.stringify({ username: identifier, password }),
			signal: controller.signal,
		}).finally(() => clearTimeout(timeout))

		if (!response.ok) {
			const errorData: unknown = await response.json().catch(() => ({}))
			logWPError('jwt-auth-failed', {
				status: response.status,
				statusText: response.statusText,
				body: JSON.stringify(errorData),
			})

			if (response.status === 403) {
				return new Response(
					JSON.stringify({ error: 'Invalid credentials', message: 'Username or password is incorrect' }),
					{ status: 401, headers: { 'Content-Type': 'application/json' } },
				)
			}

			return new Response(
				JSON.stringify({ error: 'WordPress authentication failed', details: errorData }),
				{ status: response.status, headers: { 'Content-Type': 'application/json' } },
			)
		}

		data = (await response.json()) as typeof data
	} catch (err: unknown) {
		console.error('WordPress connection error:', err)
		const errorMessage = err instanceof Error ? err.message : 'Unknown error'
		logWPError('wordpress-connection-error', {
			statusText: errorMessage,
			body: err instanceof Error ? err.stack || '' : '',
		})

		return new Response(
			JSON.stringify({ error: 'Unable to reach WordPress backend', details: errorMessage }),
			{ status: 502, headers: { 'Content-Type': 'application/json' } },
		)
	}

	const { token, user_email, user_nicename, user_display_name, user_id } = data as {
		token: string
		user_email: string
		user_nicename: string
		user_display_name: string
		user_id?: number
	}

	let wpRoles: string[] | undefined = undefined
	try {
		const wpUrl = process.env.WP_URL || 'http://example.com'
		const meResp = await fetch(`${wpUrl}/wp-json/wp/v2/users/me?context=edit`, {
			headers: {
				Authorization: `Bearer ${token}`,
				'User-Agent': 'tech-oblivion-fe/1.0',
			},
			cache: 'no-store',
		})
		if (meResp.ok) {
			const meJson: { roles?: string[] } = await meResp.json()
			if (meJson && Array.isArray(meJson.roles)) {
				wpRoles = meJson.roles
			}
		}
	} catch {
		// ignore
	}

	const sessionToken = await signSession({
		sub: String(user_id || user_nicename),
		username: user_nicename,
		email: user_email,
		roles: Array.isArray(wpRoles) && wpRoles.length ? wpRoles : ['subscriber'],
		wpUserId: user_id,
		displayName: user_display_name,
		wpToken: token,
	})

	const xfProto = req.headers.get('x-forwarded-proto')
	const isHttps = (xfProto ? xfProto.split(',')[0].trim() : '') === 'https' || new URL(req.url).protocol === 'https:'
	const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=${sessionToken}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; ${
		isHttps ? 'Secure; ' : ''
	}HttpOnly`

	return new Response(
		JSON.stringify({
			user: {
				id: data.user_id || user_nicename,
				username: user_nicename,
				email: user_email,
				displayName: user_display_name,
			},
			token,
		}),
		{ status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } },
	)
}
