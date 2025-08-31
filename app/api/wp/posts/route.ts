// Define Next.js route config locally so it's recognized
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Re-export handlers from the shared implementation
export { GET, POST, PATCH } from '../../../../src/app/api/wp/posts/route'

import { NextRequest } from 'next/server'

export async function DELETE(req: NextRequest) {
	const upstream = process.env.WP_URL || process.env.WP_BASE
	if (!upstream) return new Response(JSON.stringify({ error: 'WP_URL/WP_BASE env required' }), { status: 500 })
	const url = new URL(req.url)
	const id = url.searchParams.get('id')
	if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

	// Forward Authorization if present, else fallback
	const authHeader = req.headers.get('authorization') || (process.env.WP_AUTH_TOKEN ? `Bearer ${process.env.WP_AUTH_TOKEN}` : undefined)
	const controller = new AbortController()
	const to = setTimeout(() => controller.abort(), 10_000)
	try {
		const res = await fetch(new URL(`/wp-json/wp/v2/posts/${id}`, upstream), {
			method: 'DELETE',
			headers: { ...(authHeader ? { Authorization: authHeader } : {}), 'Content-Type': 'application/json' },
			signal: controller.signal,
		})
		const text = await res.text()
		return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
	} catch (e: any) {
		const msg = e?.name === 'AbortError' ? 'Upstream timeout' : (e?.message || 'Upstream error')
		return new Response(JSON.stringify({ error: msg }), { status: 504 })
	} finally {
		clearTimeout(to)
	}
}
