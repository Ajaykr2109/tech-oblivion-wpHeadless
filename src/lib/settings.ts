// Client/Server compatible settings - only use Node.js fs on server side
let fs: typeof import('fs').promises | null = null
let path: typeof import('path') | null = null
let SETTINGS_DIR: string | null = null
let SETTINGS_FILE: string | null = null

// Initialize server-side modules only when available
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fsModule = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    path = require('path')
    fs = fsModule.promises
    if (path) {
      SETTINGS_DIR = path.resolve(process.cwd(), 'data')
      SETTINGS_FILE = path.join(SETTINGS_DIR, 'site-settings.json')
    }
  } catch {
    // Server modules not available - running in browser
  }
}

export type SiteSettings = {
  siteTitle: string
  siteUrl: string
  defaultOgImage: string
  defaultTwitterImage?: string
  defaultDescription?: string
  robotsCustom?: string | null
  sitemapEnabled: boolean
  editorPicks?: number[]
}

function envDefaults(): SiteSettings {
  return {
    siteTitle: process.env.NEXT_PUBLIC_SITE_TITLE || 'Tech Oblivion',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://techoblivion.in',
    defaultOgImage: process.env.NEXT_PUBLIC_DEFAULT_OG || 'https://techoblivion.in/wp-content/uploads/og-default.jpg',
    defaultTwitterImage: process.env.NEXT_PUBLIC_DEFAULT_TW || undefined,
    defaultDescription: process.env.NEXT_PUBLIC_DEFAULT_DESC || undefined,
    robotsCustom: null,
    sitemapEnabled: true,
    editorPicks: [],
  }
}

export async function getSettings(): Promise<SiteSettings> {
  // If running on client side or fs not available, return defaults
  if (!fs || !SETTINGS_FILE) {
    return envDefaults()
  }
  
  try {
    const buf = await fs.readFile(SETTINGS_FILE, 'utf8')
    const parsed = JSON.parse(buf)
    return { ...envDefaults(), ...parsed }
  } catch {
    // On first run, ensure directory and file with defaults
    const defaults = envDefaults()
    try {
      if (SETTINGS_DIR) {
        await fs.mkdir(SETTINGS_DIR, { recursive: true })
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaults, null, 2), 'utf8')
      }
    } catch (error) {
      console.warn('Failed to create settings file:', error)
    }
    return defaults
  }
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  // If running on client side or fs not available, just return merged defaults
  if (!fs || !SETTINGS_FILE || !SETTINGS_DIR) {
    const current = envDefaults()
    return { ...current, ...patch }
  }
  
  const current = await getSettings()
  const next = { ...current, ...patch }
  await fs.mkdir(SETTINGS_DIR, { recursive: true })
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}
