
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
// Fix lucide-react imports: use correct icon names (no *Icon suffixes)
import { LayoutDashboard, FileText, Users, MessageSquare, Settings, Image, Tags, FolderCog, Plug, Palette, Activity, FlaskConical, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { mapToApiRole } from '@/lib/rbac'
import checkAccess from '@/lib/checkAccess'
import ErrorBoundary from '@/components/error-boundary'
import { Button } from '@/components/ui/button'

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
  { href: '/admin/media', label: 'Media', icon: Image, key: 'media' },
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
  { href: '/admin/settings', label: 'Settings', icon: Settings, key: 'settings' },
  { href: '/admin/plugins', label: 'Plugins', icon: Plug, key: 'plugins' },
      { href: '/admin/themes', label: 'Themes', icon: Palette, key: 'themes' },
      { href: '/admin/site-health', label: 'Site Health', icon: Activity, key: 'site-health' },
      { href: '/admin/logs', label: 'Authorization Logs', icon: FlaskConical, key: 'logs' },
  { href: '/admin/debug', label: 'Debug/Test', icon: FlaskConical, key: 'debug' },
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
  logs: [
    { path: '/api/logs', method: 'GET', action: 'read' },
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
  const { user } = useAuth()
  const apiRole = mapToApiRole(user?.roles)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const SidebarContent = () => (
    <>
      <div className="mb-8 flex items-center gap-2 px-2 font-bold">
        <Link href="/" className="font-bold text-lg">
          tech.oblivion
        </Link>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>
      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto" role="navigation" aria-label="Admin sidebar">
        {filtered.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-xs font-medium uppercase text-muted-foreground tracking-wider">
              {group.label}
            </div>
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
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        aria-label={`Open ${link.label}`}
                      >
                        <link.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r bg-card/50 p-4 flex-col" aria-label="Primary">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="font-bold text-lg">
            tech.oblivion
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 z-50 h-full w-64 bg-card border-r p-4 flex flex-col pt-20"
              role="navigation" aria-label="Admin sidebar"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content: independent scroll, account for fixed sidebar */}
      <main className="flex-1 h-screen overflow-y-auto pt-16 lg:pt-0 lg:ml-64" aria-live="polite">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
