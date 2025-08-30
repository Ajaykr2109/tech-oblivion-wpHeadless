import { Suspense } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getBookmarks(cookiesHeader?: string) {
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/wp/bookmarks?expand=1`, {
      cache: 'no-store',
      headers: cookiesHeader ? { cookie: cookiesHeader } : undefined,
    })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export default async function BookmarksPage() {
  // Forward cookies so upstream sees the logged-in session
  const cookie = (await import('next/headers')).cookies
  const jar = await cookie()
  const sessionName = process.env.SESSION_COOKIE_NAME || 'session'
  const c = jar.get(sessionName)?.value
  const header = c ? `${sessionName}=${c}` : undefined
  const data = await getBookmarks(header)
  const items = Array.isArray(data?.items) ? data.items as Array<any> : []
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Bookmarks</h1>
      {data === null ? (
        <div className="text-muted-foreground">Login required to view your bookmarks.</div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground">You haven't saved any bookmarks yet.</div>
      ) : (
        <ul className="space-y-4">
          {items.map(it => (
            <li key={it.id} className="rounded-2xl border p-4 hover:bg-muted/30 transition">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <a href={it.link} className="font-medium hover:underline" target="_blank" rel="noopener noreferrer">{it.title || `Post #${it.id}`}</a>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(it.date).toLocaleString()} · {it.slug}</div>
                </div>
                <div className="text-xs text-muted-foreground">{typeof it.count === 'number' ? `${it.count} saved` : ''}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 text-sm text-muted-foreground">Bookmarks are private and stored to your account.</div>
      <div className="mt-6">
        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    </div>
  )
}
