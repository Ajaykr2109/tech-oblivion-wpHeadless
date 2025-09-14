"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string
  }
}

interface TrackingHistoryItem {
  path: string
  tracked_at: string
  success: boolean
  time_on_previous_page?: number
  response?: unknown
}

interface TrackingMetrics {
  totalPageViews: number
  uniquePages: number
  sessionDuration: number
  averageTimeOnPage: number
  topPages: Array<{ path: string; views: number }>
}

interface UseTrackingOptions {
  enableRealTimeMetrics?: boolean
  enableSessionTracking?: boolean
  enablePerformanceTracking?: boolean
  debounceMs?: number
}

interface TrackingState {
  isTracking: boolean
  currentSession: string | null
  metrics: TrackingMetrics | null
  lastPageView: Date | null
  error: string | null
}

export function useTracking(options: UseTrackingOptions = {}) {
  const {
    enableRealTimeMetrics = true,
    enableSessionTracking = true,
    enablePerformanceTracking = false,
    debounceMs = 1000
  } = options

  const pathname = usePathname()
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    currentSession: null,
    metrics: null,
    lastPageView: null,
    error: null
  })

  const trackingTimeoutRef = useRef<NodeJS.Timeout>()
  const pageStartTimeRef = useRef<number>()
  const sessionStartRef = useRef<number>()

  // Generate or retrieve session ID
  const getSessionId = () => {
    const key = 'to_session_id'
    let sessionId = sessionStorage.getItem(key)
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem(key, sessionId)
      sessionStartRef.current = Date.now()
    }
    return sessionId
  }

  // Track performance metrics
  const trackPerformance = useCallback(() => {
    if (!enablePerformanceTracking) return {}
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        connectionType: (navigator as NavigatorWithConnection)?.connection?.effectiveType || 'unknown'
      }
    } catch {
      return {}
    }
  }, [enablePerformanceTracking])

  // Update metrics from tracking history
  const updateMetrics = useCallback(() => {
    if (!enableRealTimeMetrics) return

    try {
      const history: TrackingHistoryItem[] = JSON.parse(localStorage.getItem('to_tracking_history') || '[]')
      const sessionStart = sessionStartRef.current || Date.now()
      const sessionDuration = Date.now() - sessionStart

      const uniquePages = new Set(history.map((h) => h.path)).size
      const pageViews: Record<string, number> = {}
      
      history.forEach((h) => {
        pageViews[h.path] = (pageViews[h.path] || 0) + 1
      })

      const topPages = Object.entries(pageViews)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      const totalTimeOnPages = history.reduce((sum: number, h) => 
        sum + (h.time_on_previous_page || 0), 0)
      const averageTimeOnPage = history.length > 0 ? totalTimeOnPages / history.length : 0

      setState(prev => ({
        ...prev,
        metrics: {
          totalPageViews: history.length,
          uniquePages,
          sessionDuration,
          averageTimeOnPage,
          topPages
        }
      }))

    } catch (error) {
      console.warn('Failed to update metrics:', error)
    }
  }, [enableRealTimeMetrics])

  // Enhanced tracking function
  const trackPageView = useCallback(async (path: string, options: { immediate?: boolean } = {}) => {
    if (!path) return

    // Clear any pending tracking
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current)
    }

    const performTracking = async () => {
      setState(prev => ({ ...prev, isTracking: true, error: null }))
      
      try {
        const sessionId = getSessionId()
        const performanceData = trackPerformance()
        const now = Date.now()
        
        // Calculate time on previous page
        const timeOnPage = pageStartTimeRef.current 
          ? now - pageStartTimeRef.current 
          : 0

        const trackingData = {
          path,
          title: document.title || '',
          referrer: document.referrer || '',
          session_id: sessionId,
          user_agent: navigator.userAgent || '',
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          language: navigator.language || 'en',
          time_on_previous_page: timeOnPage,
          performance: performanceData,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          scroll_depth: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0
        }

        const response = await fetch('/api/analytics/page-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackingData),
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          
          setState(prev => ({
            ...prev,
            isTracking: false,
            currentSession: sessionId,
            lastPageView: new Date(),
            error: null
          }))

          // Store successful tracking
          if (enableSessionTracking) {
            const history = JSON.parse(localStorage.getItem('to_tracking_history') || '[]')
            history.push({
              ...trackingData,
              tracked_at: new Date().toISOString(),
              success: true,
              response: result
            })
            
            // Keep only last 50 entries
            if (history.length > 50) {
              history.splice(0, history.length - 50)
            }
            
            localStorage.setItem('to_tracking_history', JSON.stringify(history))
          }

          // Update real-time metrics
          if (enableRealTimeMetrics) {
            updateMetrics()
          }

        } else {
          throw new Error(`Tracking failed: ${response.status}`)
        }

      } catch (error) {
        console.warn('Page tracking failed:', error)
        setState(prev => ({
          ...prev,
          isTracking: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }

      pageStartTimeRef.current = Date.now()
    }

    if (options.immediate) {
      await performTracking()
    } else {
      trackingTimeoutRef.current = setTimeout(performTracking, debounceMs)
    }
  }, [debounceMs, enableSessionTracking, enableRealTimeMetrics, trackPerformance, updateMetrics])

  // Track page changes
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname, trackPageView])

  // Track user activity and session extension
  useEffect(() => {
    if (!enableSessionTracking) return

    let activityTimer: NodeJS.Timeout
    let lastActivity = Date.now()

    const resetActivityTimer = () => {
      lastActivity = Date.now()
      clearTimeout(activityTimer)
      
      activityTimer = setTimeout(() => {
        // Session considered inactive after 30 minutes
        if (Date.now() - lastActivity > 30 * 60 * 1000) {
          sessionStorage.removeItem('to_session_id')
          sessionStartRef.current = undefined
        }
      }, 30 * 60 * 1000)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetActivityTimer, { passive: true })
    })

    resetActivityTimer()

    return () => {
      clearTimeout(activityTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetActivityTimer)
      })
    }
  }, [enableSessionTracking])

  // Update metrics periodically
  useEffect(() => {
    if (!enableRealTimeMetrics) return

    updateMetrics()
    const interval = setInterval(updateMetrics, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [enableRealTimeMetrics, updateMetrics])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current)
      }
    }
  }, [])

  // Public API
  return {
    ...state,
    trackPageView: (path: string, immediate = false) => 
      trackPageView(path, { immediate }),
    refreshMetrics: updateMetrics,
    clearSession: () => {
      sessionStorage.removeItem('to_session_id')
      localStorage.removeItem('to_tracking_history')
      setState(prev => ({
        ...prev,
        currentSession: null,
        metrics: null,
        lastPageView: null
      }))
    },
    exportData: () => {
      return {
        session: state.currentSession,
        history: JSON.parse(localStorage.getItem('to_tracking_history') || '[]'),
        metrics: state.metrics
      }
    }
  }
}