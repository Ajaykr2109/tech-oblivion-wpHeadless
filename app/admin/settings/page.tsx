import { revalidateTag } from 'next/cache'
import { invalidateTags } from '@/lib/serverCache'
import { getSettings, updateSettings } from '@/lib/settings'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

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

    revalidateTag('sitemap')
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Global Site & SEO Defaults</CardTitle>
            <CardDescription>Manage global settings for your site's appearance and search engine optimization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveSiteSettingsAction} className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input id="siteTitle" name="siteTitle" defaultValue={settings.siteTitle} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" name="siteUrl" defaultValue={settings.siteUrl} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="defaultDescription">Default Meta Description</Label>
                <Textarea id="defaultDescription" name="defaultDescription" defaultValue={settings.defaultDescription || ''} rows={3} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="defaultOgImage">Default OG Image URL</Label>
                  <Input id="defaultOgImage" name="defaultOgImage" defaultValue={settings.defaultOgImage} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="defaultTwitterImage">Default Twitter Image URL</Label>
                  <Input id="defaultTwitterImage" name="defaultTwitterImage" defaultValue={settings.defaultTwitterImage || ''} />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="robotsCustom">robots.txt (custom override)</Label>
                <Textarea id="robotsCustom" name="robotsCustom" defaultValue={settings.robotsCustom || ''} placeholder="Leave empty to use default allow-all + sitemap" className="font-mono" rows={5} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="sitemapEnabled" name="sitemapEnabled" defaultChecked={settings.sitemapEnabled} />
                <Label htmlFor="sitemapEnabled" className="text-sm font-medium">Enable Sitemap</Label>
              </div>
              <div>
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
            <CardDescription>Manually revalidate cached content across your site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Current Cache TTL (WP_CACHE_TTL): <span className="font-mono bg-muted px-2 py-1 rounded">{ttl} seconds</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <form action={revalidateAllAction} className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-medium mb-2">Refresh Homepage</h3>
                <p className="text-xs text-muted-foreground mb-3 flex-grow">Revalidate the posts list on the homepage and blog index.</p>
                <Button type="submit" size="sm">Revalidate All Posts</Button>
              </form>
              <form action={revalidatePostAction} className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-medium mb-2">Refresh Post by Slug</h3>
                <Input name="slug" placeholder="post-slug" className="mb-3" />
                <Button type="submit" size="sm">Revalidate Post</Button>
              </form>
              <form action={revalidatePageAction} className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-medium mb-2">Refresh Page by Slug</h3>
                <Input name="page" placeholder="page-slug (e.g. about)" className="mb-3" />
                <Button type="submit" size="sm">Revalidate Page</Button>
              </form>
            </div>
             <form action={clearProcessCacheAction} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Clear In-Memory Cache (Advanced)</h3>
                <div className="flex gap-2">
                  <Input name="tags" placeholder="comma,separated,tags (default: wp:posts)" className="flex-grow" />
                  <Button type="submit" variant="secondary">Clear Cache</Button>
                </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom API Endpoints</CardTitle>
            <CardDescription>Configure custom endpoints to make them accessible within the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
               <p className="text-muted-foreground">A form to add, edit, and manage custom REST API endpoints will be displayed here.</p>
               <Button className="mt-4">Add Endpoint</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
