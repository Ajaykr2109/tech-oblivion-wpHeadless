"use client"

import React from 'react'
import { usePathname } from 'next/navigation'

import { Header } from '@/components/header'
import Footer from '@/components/Footer'
import { ReactQueryProvider } from '@/components/providers/react-query'

/**
 * RouteChrome: Shows global Header/Footer on public pages, hides them on routes
 * like /login and /admin where a custom chrome is preferred.
 */
export default function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const hideChrome = pathname === '/login' || pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && (
        // Skip link only useful when global header exists
        <a href="#main-content" className="skip-link">Skip to content</a>
      )}
      {!hideChrome && <Header />}
      <ReactQueryProvider>
        <main id="main-content" className="flex-grow">{children}</main>
      </ReactQueryProvider>
      {!hideChrome && <Footer />}
    </div>
  )
}
