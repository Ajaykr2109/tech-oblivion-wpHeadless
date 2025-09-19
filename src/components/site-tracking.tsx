"use client"
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

import { initializeAnalytics, trackPageView as trackEnhancedPageView } from '@/lib/enhanced-analytics'

interface TrackingData {
  path: string
  title: string
  referrer: string
  timestamp: number
  session_id: string
  user_agent: string
  screen_resolution: string
  timezone: string
  language: string
}

interface PageViewResponse {
  success: boolean
  session_id?: string
  page_id?: string
  views_total?: number
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getOrCreateSessionId(): string {
  const key = 'to_session_id'
  let sessionId = sessionStorage.getItem(key)
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem(key, sessionId)
  }
  return sessionId
}

function getTrackingData(path: string): TrackingData {
  return {
    path,
    title: document.title || '',
    referrer: document.referrer || '',
    timestamp: Date.now(),
    session_id: getOrCreateSessionId(),
    user_agent: navigator.userAgent || '',
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    language: navigator.language || 'en'
  }
}

async function trackPageView(data: TrackingData): Promise<PageViewResponse | null> {
  try {
    const response = await fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    
    if (response.ok) {
      return await response.json()
    }
    
    // Fallback: try the legacy post tracking for blog posts
    if (data.path.startsWith('/blog/')) {
      const postSlug = data.path.split('/blog/')[1]?.split('?')[0]
      if (postSlug && postSlug !== '') {
        // Try to extract post ID or use slug - this might need adjustment based on your data
        const fallbackResponse = await fetch('/api/wp/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_slug: postSlug }),
          credentials: 'include'
        })
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          return { success: true, views_total: fallbackData.views_total }
        }
      }
    }
    
    return null
  } catch (error) {
    console.warn('Page tracking failed:', error)
    return null
  }
}

export default function SiteTracking() {
  const pathname = usePathname()
  const trackingRef = useRef<Set<string>>(new Set())
  const lastPathRef = useRef<string>('')
  const analyticsInitialized = useRef(false)

  // Initialize enhanced analytics once
  useEffect(() => {
    if (!analyticsInitialized.current) {
      initializeAnalytics()
      analyticsInitialized.current = true
    }
  }, [])

  useEffect(() => {
    // Avoid duplicate tracking for the same path in rapid succession
    if (!pathname || lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    // Generate a unique key for this specific page view
    const viewKey = `${pathname}-${Date.now()}`
    if (trackingRef.current.has(viewKey)) return
    trackingRef.current.add(viewKey)

    // Capture the current ref value for use in cleanup
    const currentTrackingSet = trackingRef.current

    // Small delay to ensure the page is fully loaded and title is set
    const timeoutId = setTimeout(async () => {
      const trackingData = getTrackingData(pathname)
      
      // Track with both legacy and enhanced analytics
      const [legacyResult] = await Promise.all([
        trackPageView(trackingData),
        trackEnhancedPageView({ 
          path: pathname, 
          title: document.title,
          referrer: document.referrer,
          sessionId: trackingData.session_id
        })
      ])
      
      if (legacyResult?.success) {
        // Store successful tracking in localStorage for offline analysis
        const trackingHistory = JSON.parse(localStorage.getItem('to_tracking_history') || '[]')
        trackingHistory.push({
          ...trackingData,
          tracked_at: new Date().toISOString(),
          success: true
        })
        
        // Keep only last 100 entries to avoid localStorage bloat
        if (trackingHistory.length > 100) {
          trackingHistory.splice(0, trackingHistory.length - 100)
        }
        
        localStorage.setItem('to_tracking_history', JSON.stringify(trackingHistory))
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      // Clean up old tracking keys to prevent memory leaks
      // Use the captured ref value instead of accessing trackingRef.current
      if (currentTrackingSet.size > 50) {
        currentTrackingSet.clear()
      }
    }
  }, [pathname])

  // Also track when user becomes active after being idle
  useEffect(() => {
    let isIdle = false
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      if (isIdle) {
        isIdle = false
        // Re-track the current page when user becomes active again
        if (pathname) {
          const trackingData = getTrackingData(pathname)
          trackPageView({ ...trackingData, timestamp: Date.now() })
        }
      }
      
      idleTimer = setTimeout(() => {
        isIdle = true
      }, 30000) // 30 seconds of inactivity
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true })
    })

    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [pathname])

  return null // This component doesn't render anything
}