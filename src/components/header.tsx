
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "./ui/dropdown-menu";
import { RoleGate } from "@/hooks/useRoleGate";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/profile", label: "Profile" },
];

interface User {
  id?: number | string
  username: string
  email: string
  displayName: string
  roles?: string[]
  profile_fields?: Record<string,string>
}

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
  const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Use GET redirect so the server clears cookie and navigates in one step
      window.location.href = '/api/auth/logout?redirect=/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isPostDetail = (() => {
    const p = pathname || '/'
    const parts = p.split('/').filter(Boolean)
    return parts.length === 2 && parts[0] === 'blog'
  })()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="font-bold">
              tech.oblivion
            </span>
          </Link>
        </div>

  <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main">
      {navLinks.map((link) => {
        const computedHref = link.label === "Profile"
          ? (user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile")
          : link.href;
        return (
          <Link
            key={link.label}
            href={computedHref}
            className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-current={pathname === computedHref ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
      {user && (
        <Link
          href="/bookmarks"
          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Bookmarks
        </Link>
      )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground px-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-haspopup="menu" aria-expanded={undefined}>
                  More <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <RoleGate action="admin" as="div">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Admin</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem asChild><Link href="/admin">Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/posts">Posts</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/users">Users</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/comments">Comments</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/admin/settings">Settings</Link></DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </RoleGate>
                <RoleGate action="draft" as="div">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Dashboard</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem asChild><Link href="/account">My Account</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/editor">My Posts</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/account">Settings</Link></DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </RoleGate>
              </DropdownMenuContent>
            </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" aria-label="User menu">
                      {(() => {
                        const uname = user.username || ''
                        const dname = user.displayName || ''
                        // If short username (<=10), show full
                        if (uname && uname.length <= 10) return `Hi, ${uname}`
                        // If displayName is long, use first + last initial
                        if (dname && dname.trim().includes(' ')) {
                          const parts = dname.trim().split(/\s+/)
                          const first = parts[0]
                          const last = parts[parts.length - 1]
                          return `Hi, ${first} ${last?.charAt(0) || ''}.`
                        }
                        // Else show first two chars of username
                        return `Hi, ${(uname || dname).slice(0, 2)}`
                      })()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/account">Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/account">Account Center</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile"}>Public Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button onClick={handleLogout}>Logout</button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
              )}
            </>
          )}

          {!isPostDetail && <ThemeToggle />}
           <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle navigation"
>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <span>tech.oblivion</span>
                </Link>
                {navLinks.map((link) => {
                  const computedHref = link.label === "Profile"
                    ? (user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile")
                    : link.href;
                  return (
                    <Link
                      key={link.label}
                      href={computedHref}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {user && (
                  <Link href="/bookmarks" className="text-muted-foreground hover:text-foreground">Bookmarks</Link>
                )}
                 <RoleGate action="admin" as="div">
                   <Link href="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
                 </RoleGate>
                 <RoleGate action="draft" as="div">
                   <Link href="/account" className="text-muted-foreground hover:text-foreground">Account</Link>
                 </RoleGate>
                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        <div className="text-muted-foreground">
                          Welcome, {user.username}
                        </div>
                        <RoleGate action="draft" as="div">
                          <Link href="/account" className="text-muted-foreground hover:text-foreground">
                            Dashboard
                          </Link>
                        </RoleGate>
                        <Link href="/account" className="text-muted-foreground hover:text-foreground">
                          Account Center
                        </Link>
                        <a href="/api/auth/logout?redirect=/" className="text-left text-muted-foreground hover:text-foreground">
                          Logout
                        </a>
                      </>
                    ) : (
                      <Link href="/login" className="text-muted-foreground hover:text-foreground">
                        Login
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
