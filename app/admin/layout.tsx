
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, MessageSquare, SettingsIcon, ImageIcon, Tags, FolderCog, PlugIcon, Palette, Activity, TestTubes } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { useMe } from '@/hooks/useRoleGate'
import { mapToApiRole } from '@/lib/rbac'
import checkAccess from '@/lib/checkAccess'

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>
type Item = { href: string; label: string; icon: IconType; key: string }
type Group = { label: string; items: Item[] }

const RAW_GROUPS: Group[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
      { href: '/admin/analytics', label: 'Analytics', icon: Activity, key: 'analytics' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/posts', label: 'Posts', icon: FileText, key: 'posts' },
      { href: '/admin/media', label: 'Media', icon: ImageIcon, key: 'media' },
      { href: '/admin/categories', label: 'Categories', icon: FolderCog, key: 'categories' },
      { href: '/admin/tags', label: 'Tags', icon: Tags, key: 'tags' },
      { href: '/admin/comments', label: 'Comments', icon: MessageSquare, key: 'comments' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users, key: 'users' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, key: 'settings' },
      { href: '/admin/plugins', label: 'Plugins', icon: PlugIcon, key: 'plugins' },
      { href: '/admin/themes', label: 'Themes', icon: Palette, key: 'themes' },
      { href: '/admin/site-health', label: 'Site Health', icon: Activity, key: 'site-health' },
      { href: '/admin/debug', label: 'Debug/Test', icon: TestTubes, key: 'debug' },
    ],
  },
]

// Associate keys with RBAC-capable endpoints for gating
const KEY_TO_ENDPOINT: Record<string, { path: string; method: string; action: 'read' | 'write' | 'delete' | 'moderate' }[]> = {
  analytics: [
    { path: '/api/analytics/summary', method: 'GET', action: 'read' },
  ],
  posts: [
    { path: '/api/wp/posts', method: 'POST', action: 'write' },
  ],
  media: [
    { path: '/api/wp/media', method: 'POST', action: 'write' },
  ],
  categories: [
    { path: '/api/wp/categories', method: 'POST', action: 'write' },
  ],
  tags: [
    { path: '/api/wp/tags', method: 'POST', action: 'write' },
  ],
  comments: [
    { path: '/api/wp/comments/[id]', method: 'PATCH', action: 'moderate' },
  ],
  users: [
    { path: '/api/wp/users', method: 'GET', action: 'read' },
  ],
  settings: [
    { path: '/api/wp/settings', method: 'GET', action: 'read' },
  ],
  plugins: [
    { path: '/api/wp/plugins', method: 'GET', action: 'read' },
  ],
  themes: [
    { path: '/api/wp/themes', method: 'GET', action: 'read' },
  ],
  'site-health': [
    { path: '/api/wp/site-health/background-updates', method: 'GET', action: 'read' },
  ],
  debug: [
    { path: '/api/_debug', method: 'GET', action: 'read' },
    { path: '/api/test', method: 'GET', action: 'read' },
  ],
  dashboard: [
    { path: '/api/admin', method: 'GET', action: 'read' },
  ],
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { me } = useMe()
  const apiRole = mapToApiRole(me?.roles)

  // Build groups filtered by RBAC matrix; also dedupe by key
  const filtered: Group[] = RAW_GROUPS.map((g) => {
    const uniq = new Map<string, Item>()
    for (const it of g.items) {
      if (uniq.has(it.key)) continue
      const endpoints = KEY_TO_ENDPOINT[it.key] || []
      const allowed = endpoints.length === 0 || endpoints.some((e) => checkAccess(apiRole, e.path, e.method, e.action))
      if (allowed) uniq.set(it.key, it)
    }
    return { label: g.label, items: Array.from(uniq.values()) }
  }).filter((g) => g.items.length > 0)

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r bg-card/50 p-4">
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center gap-2 px-2 font-bold">
            <Link href="/" className="font-bold">
              tech.oblivion
            </Link>
            <div className="ml-auto"><ThemeToggle /></div>
          </div>
          <nav className="flex flex-col gap-4">
            {filtered.map((group) => (
              <div key={group.label}>
                <div className="px-3 pb-1 text-xs font-medium uppercase text-muted-foreground">{group.label}</div>
                <div className="flex flex-col gap-1">
                  <AnimatePresence initial={false}>
                    {group.items.map((link) => {
                      const isActive = pathname === link.href
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Link
                            href={link.href}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            <span>{link.label}</span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
