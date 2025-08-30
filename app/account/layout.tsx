'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User as UserIcon, LayoutDashboard, Shield, Image as ImageIcon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarNavLinks = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/profile', label: 'Profile', icon: UserIcon },
  { href: '/account/avatar', label: 'Avatar', icon: ImageIcon },
  { href: '/account/security', label: 'Security', icon: Shield },
  { href: '/account/settings', label: 'Preferences', icon: Settings },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r bg-card/50 p-4">
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center gap-2 px-2 font-bold">
            <Link href="/" className="font-bold">
              tech.oblivion
            </Link>
          </div>
          <nav className="flex flex-col gap-2">
            {sidebarNavLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
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
              )
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  )
}
