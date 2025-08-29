import { revalidateTag } from 'next/cache'
import { invalidateTags } from '@/lib/serverCache'

export default function AdminSettingsPage() {
  const ttl = Number(process.env.WP_CACHE_TTL || 300)

  async function revalidateAllAction() {
    'use server'
    revalidateTag('wp:posts')
  }

  async function revalidatePostAction(formData: FormData) {
    'use server'
    const slug = String(formData.get('slug') || '').trim()
    if (slug) revalidateTag(`wp:post:${slug}`)
  }

  async function revalidatePageAction(formData: FormData) {
    'use server'
    const slug = String(formData.get('page') || '').trim()
    if (slug) revalidateTag(`wp:page:${slug}`)
  }

  async function clearProcessCacheAction(formData: FormData) {
    'use server'
    const raw = String(formData.get('tags') || '').trim()
    const tags = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : ['wp:posts']
    invalidateTags(tags)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
      <p className="text-muted-foreground mb-8">Cache controls and revalidation tools.</p>

      <div className="space-y-8">
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Cache TTL</h2>
          <p className="text-sm text-muted-foreground">Current TTL (WP_CACHE_TTL): <span className="font-mono">{ttl}s</span></p>
          <p className="text-xs text-muted-foreground mt-1">To change TTL, set WP_CACHE_TTL in your environment and restart the app.</p>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Revalidation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <form action={revalidateAllAction} className="border rounded p-3">
              <h3 className="font-medium mb-2">Refresh List</h3>
              <p className="text-xs text-muted-foreground mb-3">Revalidate the posts list (homepage/blog index).</p>
              <button className="bg-primary text-primary-foreground px-3 py-2 rounded" type="submit">Revalidate All</button>
            </form>

            <form action={revalidatePostAction} className="border rounded p-3">
              <h3 className="font-medium mb-2">Refresh Post</h3>
              <input name="slug" placeholder="post-slug" className="border rounded p-2 w-full mb-3" />
              <button className="bg-primary text-primary-foreground px-3 py-2 rounded" type="submit">Revalidate Post</button>
            </form>

            <form action={revalidatePageAction} className="border rounded p-3">
              <h3 className="font-medium mb-2">Refresh Page</h3>
              <input name="page" placeholder="page-slug (e.g. about)" className="border rounded p-2 w-full mb-3" />
              <button className="bg-primary text-primary-foreground px-3 py-2 rounded" type="submit">Revalidate Page</button>
            </form>

            <form action={clearProcessCacheAction} className="border rounded p-3">
              <h3 className="font-medium mb-2">Clear Process Cache (Advanced)</h3>
              <input name="tags" placeholder="comma,separated,tags (default: wp:posts)" className="border rounded p-2 w-full mb-3" />
              <button className="bg-secondary text-secondary-foreground px-3 py-2 rounded" type="submit">Clear In-Memory Cache</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
