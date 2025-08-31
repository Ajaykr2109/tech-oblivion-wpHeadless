"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = usePathname() || '/'
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = parts.map((p, i) => ({
    href: '/' + parts.slice(0, i + 1).join('/'),
    label: p.replace(/-/g, ' '),
  }))
  return (
    <div className="mb-6 border-b pb-4">
      <nav className="mb-2 text-xs text-muted-foreground">
        <ol className="flex items-center gap-1">
          <li><Link href="/">Home</Link></li>
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              <span>/</span>
              {i === crumbs.length - 1 ? (
                <span className="font-medium text-foreground">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:underline">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="text-3xl font-bold capitalize">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )
}
