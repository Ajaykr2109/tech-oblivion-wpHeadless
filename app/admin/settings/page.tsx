import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { invalidateTags } from '@/lib/serverCache'
import { getSettings, updateSettings } from '@/lib/settings'
import { requireAnyRole } from '@/lib/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export default async function AdminSettingsPage() {
  
  const ttl = Number(process.env.WP_CACHE_TTL || 300)
  const settings = await getSettings()

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

  async function saveSiteSettingsAction(formData: FormData) {
    'use server'
    const siteTitle = String(formData.get('siteTitle') || '').trim()
    const siteUrl = String(formData.get('siteUrl') || '').trim()
    const defaultOgImage = String(formData.get('defaultOgImage') || '').trim()
    const defaultTwitterImage = String(formData.get('defaultTwitterImage') || '').trim()
    const defaultDescription = String(formData.get('defaultDescription') || '').trim()
    const robotsCustom = String(formData.get('robotsCustom') || '')
    const sitemapEnabled = formData.get('sitemapEnabled') === 'on'

    await updateSettings({
      siteTitle: siteTitle || undefined as any,
      siteUrl: siteUrl || undefined as any,
      defaultOgImage: defaultOgImage || undefined as any,
      defaultTwitterImage: defaultTwitterImage || undefined,
      defaultDescription: defaultDescription || undefined,
      robotsCustom: robotsCustom || null,
      sitemapEnabled,
    })

    // Revalidate sitemap/robots
    revalidateTag('sitemap')
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
      <p className="text-muted-foreground mb-8">Manage cache controls, SEO defaults, custom API endpoints, and revalidation tools.</p>

      <div className="space-y-8">
        <section className="border rounded-lg p-6 bg-card/80">
          <h2 className="text-xl font-semibold mb-4">Global Site & SEO Defaults</h2>
          <form action={saveSiteSettingsAction} className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Site Title</span>
              <Input name="siteTitle" defaultValue={settings.siteTitle} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Site URL</span>
              <Input name="siteUrl" defaultValue={settings.siteUrl} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Default Meta Description</span>
              <Textarea name="defaultDescription" defaultValue={settings.defaultDescription || ''} rows={3} />
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">Default OG Image URL</span>
                <Input name="defaultOgImage" defaultValue={settings.defaultOgImage} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">Default Twitter Image URL</span>
                <Input name="defaultTwitterImage" defaultValue={settings.defaultTwitterImage || ''} />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">robots.txt (custom override)</span>
              <Textarea name="robotsCustom" defaultValue={settings.robotsCustom || ''} placeholder="Leave empty to use default allow-all + sitemap" className="font-mono" rows={5} />
            </label>
            <label className="flex items-center gap-2 mt-2">
              <Checkbox id="sitemapEnabled" name="sitemapEnabled" defaultChecked={settings.sitemapEnabled} />
              <label htmlFor="sitemapEnabled" className="text-sm font-medium">Enable Sitemap</label>
            </label>
            <div>
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </section>

        <section className="border rounded-lg p-6 bg-card/80">
          <h2 className="text-xl font-semibold mb-4">Custom API Endpoints</h2>
          <p className="text-sm text-muted-foreground mb-4">Configure custom endpoints to make them accessible within the admin dashboard.</p>
          <div className="p-4 border-2 border-dashed rounded-lg">
             <p className="text-muted-foreground">A form to add/edit custom REST API endpoints will go here.</p>
          </div>
        </section>

        <section className="border rounded-lg p-6 bg-card/80">
          <h2 className="text-xl font-semibold mb-2">Cache TTL</h2>
          <p className="text-sm text-muted-foreground">Current TTL (WP_CACHE_TTL): <span className="font-mono">{ttl}s</span></p>
          <p className="text-xs text-muted-foreground mt-1">To change TTL, set WP_CACHE_TTL in your environment and restart the app.</p>
        </section>

        <section className="border rounded-lg p-6 bg-card/80">
          <h2 className="text-xl font-semibold mb-4">Revalidation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <form action={revalidateAllAction} className="border rounded p-4 bg-background">
              <h3 className="font-medium mb-2">Refresh List</h3>
              <p className="text-xs text-muted-foreground mb-3">Revalidate the posts list (homepage/blog index).</p>
              <Button type="submit">Revalidate All</Button>
            </form>

            <form action={revalidatePostAction} className="border rounded p-4 bg-background">
              <h3 className="font-medium mb-2">Refresh Post</h3>
              <Input name="slug" placeholder="post-slug" className="mb-3" />
              <Button type="submit">Revalidate Post</Button>
            </form>

            <form action={revalidatePageAction} className="border rounded p-4 bg-background">
              <h3 className="font-medium mb-2">Refresh Page</h3>
              <Input name="page" placeholder="page-slug (e.g. about)" className="mb-3" />
              <Button type="submit">Revalidate Page</Button>
            </form>

            <form action={clearProcessCacheAction} className="border rounded p-4 bg-background">
              <h3 className="font-medium mb-2">Clear Process Cache (Advanced)</h3>
              <Input name="tags" placeholder="comma,separated,tags (default: wp:posts)" className="mb-3" />
              <Button type="submit" variant="secondary">Clear In-Memory Cache</Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
