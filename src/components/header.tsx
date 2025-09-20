"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { UserMenuSkeleton, AuthButtonSkeleton, AdminMenuSkeleton } from "@/components/ui/auth-skeletons";
import NavbarSearch from "@/components/navbar-search";

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
  const { user, isLoading, can } = useAuth();
  const userSlug = useMemo(() => {
    if (!user) return null
    return (user.slug || user.user_nicename || user.username || null) as string | null
  }, [user])

  const isUserAdmin = can('admin');

  // No extra requests: slug comes from auth context

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold group">
            <span className="gradient-text text-xl font-bold tracking-tight">
              tech.oblivion
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Main">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                pathname === link.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}

          {/* Profile & Bookmarks moved into user dropdown */}
        </nav>

  <div className="flex items-center gap-4 relative">
          {/* Search Component */}
          <NavbarSearch />
          
          {isLoading ? (
            <UserMenuSkeleton />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="hidden md:flex items-center gap-2"
                  aria-label="User menu"
                >
                  {(() => {
                    const dname = user.displayName || "";
                    const uname = user.username || "";
                    
                    let firstName = "";
                    
                    // Try to get first name from displayName first
                    if (dname && dname.trim().includes(" ")) {
                      const parts = dname.trim().split(/\s+/);
                      firstName = parts[0];
                    } else if (dname) {
                      firstName = dname;
                    } else if (uname) {
                      firstName = uname;
                    }
                    
                    // Capitalize first letter and make rest lowercase
                    if (firstName) {
                      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                      return `Hi, ${firstName}`;
                    }
                    
                    return "Hi, User";
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isUserAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">Admin Dash</Link>
                  </DropdownMenuItem>
                )}
                {userSlug && (
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${userSlug}`}>Profile</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks">Bookmarks</Link>
                </DropdownMenuItem>
                {isUserAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account Center</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <button onClick={handleLogout}>Logout</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              className="hidden md:flex"
              onClick={() => { window.location.href = '/login'; }}
            >
              Login
            </Button>
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

                {isLoading ? (
                  <AdminMenuSkeleton />
                ) : isUserAdmin && (
                  <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
                    Admin Dash
                  </Link>
                )}

                {/* Account link removed from main nav per requirements (Account option removed). */}

                {isLoading ? (
                  <AuthButtonSkeleton />
                ) : user ? (
                  <>
                    <div className="text-muted-foreground">
                      {(() => {
                        const dname = user.displayName || "";
                        const uname = user.username || "";
                        
                        let firstName = "";
                        
                        // Try to get first name from displayName first
                        if (dname && dname.trim().includes(" ")) {
                          const parts = dname.trim().split(/\s+/);
                          firstName = parts[0];
                        } else if (dname) {
                          firstName = dname;
                        } else if (uname) {
                          firstName = uname;
                        }
                        
                        // Capitalize first letter and make rest lowercase
                        if (firstName) {
                          firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                          return `Hi, ${firstName}`;
                        }
                        
                        return "Hi, User";
                      })()}
                    </div>
                    {isUserAdmin && (
                      <Link href="/account" className="text-muted-foreground hover:text-foreground">Account Center</Link>
                    )}
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
