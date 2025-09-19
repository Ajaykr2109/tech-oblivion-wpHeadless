'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { initializeAnalytics, trackPageView } from '@/lib/enhanced-analytics'

export function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize analytics on mount
    const analytics = initializeAnalytics()
    
    return () => {
      // Cleanup on unmount
      analytics?.destroy()
    }
  }, [])

  useEffect(() => {
    // Track page views on route changes
    trackPageView({
      path: pathname || '/',
      title: document.title
    })
  }, [pathname])

  return {
    trackPageView,
    trackEvent: (type: string, data: Record<string, unknown>) => {
      // Custom event tracking can be added here
      console.log('Custom event:', type, data)
    }
  }
}

export default useAnalytics