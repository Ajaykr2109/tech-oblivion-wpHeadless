'use client'

interface PageView {
  path: string
  title: string
  referrer?: string
  sessionId?: string
  screenResolution?: string
  timezone?: string
  language?: string
  performanceMetrics?: PerformanceMetrics
  scrollDepth?: number
  timeOnPage?: number
  pageExit?: boolean
}

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  // Additional metrics
  domContentLoaded?: number
  loadComplete?: number
  ttfb?: number // Time to First Byte
}

interface SessionData {
  sessionId: string
  startTime: number
  lastActivity: number
  pageCount: number
  events: AnalyticsEvent[]
}

interface AnalyticsEvent {
  type: 'page_view' | 'scroll' | 'click' | 'exit' | 'performance'
  timestamp: number
  data: Record<string, unknown>
}

// Simple in-memory debounce map for this tab
const lastSendMap: Map<string, number> = new Map()

class EnhancedAnalytics {
  private sessionId: string
  private startTime: number
  private lastScrollDepth: number = 0
  private pageStartTime: number = 0
  private isExiting: boolean = false
  private performanceObserver?: PerformanceObserver
  private events: AnalyticsEvent[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.pageStartTime = Date.now()
    
    if (typeof window !== 'undefined') {
      this.initializeTracking()
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('exit', { type: 'visibility_hidden' })
      }
    })

    // Track scroll depth
    let scrollTimeout: NodeJS.Timeout
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.trackScrollDepth()
      }, 100)
    })

    // Track page exit
    window.addEventListener('beforeunload', () => {
      this.trackPageExit()
    })

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      this.trackEvent('click', {
        element: target.tagName,
        text: target.textContent?.slice(0, 100),
        href: target instanceof HTMLAnchorElement ? target.href : null
      })
    })

    // Track performance metrics
    this.initializePerformanceTracking()
  }

  private initializePerformanceTracking() {
    // Web Vitals tracking
    if ('PerformanceObserver' in window) {
      // Track LCP
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackEvent('performance', {
              metric: 'lcp',
              value: entry.startTime
            })
          }
        })
      })
      this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Track FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            this.trackEvent('performance', {
              metric: 'fid',
              value: (entry as PerformanceEventTiming).processingStart - entry.startTime
            })
          }
        })
      }).observe({ entryTypes: ['first-input'] })

      // Track CLS
      new PerformanceObserver((list) => {
        let cls = 0
        list.getEntries().forEach((entry) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!(entry as any).hadRecentInput) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cls += (entry as any).value
          }
        })
        this.trackEvent('performance', {
          metric: 'cls',
          value: cls
        })
      }).observe({ entryTypes: ['layout-shift'] })
    }

    // Track navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          this.trackEvent('performance', {
            metric: 'navigation',
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart,
            ttfb: navigation.responseStart - navigation.fetchStart
          })
        }
      }, 0)
    })
  }

  private trackScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100)
    
    if (scrollDepth > this.lastScrollDepth) {
      this.lastScrollDepth = scrollDepth
      this.trackEvent('scroll', { depth: scrollDepth })
    }
  }

  private trackEvent(type: AnalyticsEvent['type'], data: Record<string, unknown>) {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data
    }
    this.events.push(event)
    
    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100)
    }
  }

  private getPerformanceMetrics(): PerformanceMetrics {
    const performanceEvents = this.events.filter(e => e.type === 'performance')
    const metrics: PerformanceMetrics = {}
    
    performanceEvents.forEach(event => {
      const { metric, value, ...otherData } = event.data
      if (metric && typeof metric === 'string' && typeof value === 'number') {
        (metrics as Record<string, number>)[metric] = value
      } else {
        Object.assign(metrics, otherData)
      }
    })
    
    return metrics
  }

  private trackPageExit() {
    if (this.isExiting) return
    this.isExiting = true
    
    const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000)

    // Record exit metrics locally to be associated with next event/session if needed,
    // but DO NOT send an extra network page-view on exit to avoid double-counting.
    this.trackEvent('exit', {
      type: 'beforeunload',
      timeOnPage,
      scrollDepth: this.lastScrollDepth,
    })
  }

  private shouldDebounce(path: string, sessionId: string, minMs = 4000): boolean {
    try {
      const key = `pv:${sessionId}:${path}`
      const now = Date.now()
      // sessionStorage guard (per-tab session)
      const last = Number(sessionStorage.getItem(key) || '0')
      const memLast = lastSendMap.get(key) || 0
      const lastTs = Math.max(last, memLast)
      if (now - lastTs < minMs) return true
      sessionStorage.setItem(key, String(now))
      lastSendMap.set(key, now)
      return false
    } catch {
      // If storage fails, fall back to in-memory map only
      const key = `pv:${sessionId}:${path}`
      const now = Date.now()
      const memLast = lastSendMap.get(key) || 0
      if (now - memLast < minMs) return true
      lastSendMap.set(key, now)
      return false
    }
  }

  public trackPageView(data: Partial<PageView> = {}) {
    const pageView: PageView = {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      sessionId: this.sessionId,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      performanceMetrics: this.getPerformanceMetrics(),
      scrollDepth: this.lastScrollDepth,
      timeOnPage: Math.round((Date.now() - this.pageStartTime) / 1000),
      ...data
    }

    // Debounce duplicate sends for the same path/session in quick succession
    const safePath = pageView.path || window.location.pathname || '/'
    const safeSession = pageView.sessionId || this.sessionId || 'anon'
    if (!data.pageExit && this.shouldDebounce(safePath, safeSession)) {
      return
    }

    // Reset page timer if this is a valid new page view
    if (!data.pageExit) {
      this.pageStartTime = Date.now()
      this.lastScrollDepth = 0
    }

    // Send to tracking endpoint
    this.sendTrackingData(pageView)
  }

  private async sendTrackingData(data: PageView) {
    try {
      // Use Next.js API proxy instead of direct WordPress endpoint
      const response = await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: data.path,
          title: data.title,
          referrer: data.referrer,
          session_id: data.sessionId,
          screen_resolution: data.screenResolution,
          timezone: data.timezone,
          language: data.language,
          performance_metrics: data.performanceMetrics,
          scroll_depth: data.scrollDepth,
          time_on_page: data.timeOnPage,
          page_exit: data.pageExit
        }),
      })

      if (!response.ok) {
        console.warn('Enhanced analytics tracking failed:', response.statusText)
      }
    } catch (error) {
      console.warn('Enhanced analytics tracking error:', error)
    }
  }

  public getSessionData(): SessionData {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      lastActivity: Date.now(),
      pageCount: this.events.filter(e => e.type === 'page_view').length,
      events: this.events
    }
  }

  public destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }
  }
}

// Global analytics instance
let analyticsInstance: EnhancedAnalytics | null = null

export function initializeAnalytics(options?: { autoTrack?: boolean }) {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    analyticsInstance = new EnhancedAnalytics()
    // Optionally track initial page view (disabled by default to avoid duplicates)
    if (options?.autoTrack) analyticsInstance.trackPageView()
  }
  return analyticsInstance
}

export function trackPageView(data?: Partial<PageView>) {
  if (analyticsInstance) {
    analyticsInstance.trackPageView(data)
  }
}

export function getAnalyticsInstance() {
  return analyticsInstance
}

export default EnhancedAnalytics