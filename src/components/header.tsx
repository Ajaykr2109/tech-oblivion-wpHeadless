"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUserSlug } from "@/lib/user-slug";
import { isAdmin } from "@/lib/permissions";
import type { User } from "@/lib/auth";

import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  // Profile & Bookmarks intentionally excluded from main nav; moved into user dropdown per requirements
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);

          if (data.user) {
            const slug = await getCurrentUserSlug();
            setUserSlug(slug);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Use GET redirect so the server clears cookie and navigates in one step
      window.location.href = "/api/auth/logout?redirect=/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Profile & Bookmarks removed from main navigation (desktop & mobile)
  const filteredNavLinks = navLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="font-bold">tech.oblivion</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}

          {/* Profile & Bookmarks moved into user dropdown */}
        </nav>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" aria-label="User menu">
                      {(() => {
                        const uname = user.username || "";
                        const dname = user.display_name || "";
                        if (uname && uname.length <= 10) return `Hi, ${uname}`;
                        if (dname && dname.trim().includes(" ")) {
                          const parts = dname.trim().split(/\s+/);
                          const first = parts[0];
                          const last = parts[parts.length - 1];
                          return `Hi, ${first} ${last?.charAt(0) || ""}.`;
                        }
                        return `Hi, ${(uname || dname).slice(0, 2)}`;
                      })()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAdmin(user) && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">Admin Dash</Link>
                      </DropdownMenuItem>
                    )}
                    {userSlug && (
                      <DropdownMenuItem>
                        <Link href={`/profile/${userSlug}`}>Profile</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks">Bookmarks</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/account">Account Center</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button onClick={handleLogout}>Logout</button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" onClick={() => { window.location.href = '/login'; }}>Login</Button>
              )}
            </>
          )}

          {/* Single ThemeToggle */}
          <ThemeToggle />

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
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <span>tech.oblivion</span>
                </Link>

                {filteredNavLinks.map((link) => (
                  <Link key={link.label} href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                ))}

                {/* Profile & Bookmarks removed from mobile sheet main list to consolidate in dropdown */}

                {!isLoading && isAdmin(user) && (
                  <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
                    Admin Dash
                  </Link>
                )}

                {/* Account link removed from main nav per requirements (Account option removed). */}

                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        <div className="text-muted-foreground">Welcome, {user.username}</div>
                        <Link href="/account" className="text-muted-foreground hover:text-foreground">Account Center</Link>
                        <Link href="/bookmarks" className="text-muted-foreground hover:text-foreground">Bookmarks</Link>
                        {userSlug && (
                          <Link href={`/profile/${userSlug}`} className="text-muted-foreground hover:text-foreground">Profile</Link>
                        )}
                        <a href="/api/auth/logout?redirect=/" className="text-left text-muted-foreground hover:text-foreground">
                          Logout
                        </a>
                      </>
                    ) : (
                      <Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
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
