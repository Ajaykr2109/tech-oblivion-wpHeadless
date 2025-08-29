import { promises as fs } from 'fs'
import path from 'path'

export type SiteSettings = {
  siteTitle: string
  siteUrl: string
  defaultOgImage: string
  defaultTwitterImage?: string
  defaultDescription?: string
  robotsCustom?: string | null
  sitemapEnabled: boolean
}

const SETTINGS_DIR = path.resolve(process.cwd(), 'data')
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'site-settings.json')

function envDefaults(): SiteSettings {
  return {
    siteTitle: process.env.NEXT_PUBLIC_SITE_TITLE || 'Tech Oblivion',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://techoblivion.in',
    defaultOgImage: process.env.NEXT_PUBLIC_DEFAULT_OG || 'https://techoblivion.in/wp-content/uploads/og-default.jpg',
    defaultTwitterImage: process.env.NEXT_PUBLIC_DEFAULT_TW || undefined,
    defaultDescription: process.env.NEXT_PUBLIC_DEFAULT_DESC || undefined,
    robotsCustom: null,
    sitemapEnabled: true,
  }
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const buf = await fs.readFile(SETTINGS_FILE, 'utf8')
    const parsed = JSON.parse(buf)
    return { ...envDefaults(), ...parsed }
  } catch {
    // On first run, ensure directory and file with defaults
    const defaults = envDefaults()
    try {
      await fs.mkdir(SETTINGS_DIR, { recursive: true })
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaults, null, 2), 'utf8')
    } catch {}
    return defaults
  }
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings()
  const next = { ...current, ...patch }
  await fs.mkdir(SETTINGS_DIR, { recursive: true })
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}
