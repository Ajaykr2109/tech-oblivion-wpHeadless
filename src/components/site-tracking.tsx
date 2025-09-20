"use client"
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

import { initializeAnalytics, trackPageView as trackEnhancedPageView } from '@/lib/enhanced-analytics'

// Minimal, single-source page view tracker. We rely solely on enhanced analytics
// which sends one POST to /api/analytics/page-view and has built-in debouncing.
export default function SiteTracking() {
  const pathname = usePathname()
  const lastPathRef = useRef<string>('')
  const analyticsInitialized = useRef(false)

  // Initialize enhanced analytics once (no auto to avoid double on hydration)
  useEffect(() => {
    if (!analyticsInitialized.current) {
      initializeAnalytics({ autoTrack: false })
      analyticsInitialized.current = true
    }
  }, [])

  useEffect(() => {
    if (!pathname || lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    // Slight delay to allow title to settle; then send a single page-view
    const id = setTimeout(() => {
      trackEnhancedPageView({
        path: pathname,
        title: document.title,
        referrer: document.referrer,
      })
    }, 300)

    return () => clearTimeout(id)
  }, [pathname])

  return null
}