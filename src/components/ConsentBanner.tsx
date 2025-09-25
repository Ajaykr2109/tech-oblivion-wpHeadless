'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

interface ConsentPreferences {
  necessary: boolean      // Always true, cannot be disabled
  analytics: boolean      // Google Analytics, performance tracking
  marketing: boolean      // Marketing cookies, social media
  functional: boolean     // User preferences, enhanced features
}

const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false
}

// Cookie consent storage
const CONSENT_COOKIE_NAME = 'techoblivion_consent'
const CONSENT_VERSION = '1.0'

interface ConsentData {
  version: string
  timestamp: number
  preferences: ConsentPreferences
}

// Secure consent storage
function saveConsentPreferences(preferences: ConsentPreferences) {
  const consentData: ConsentData = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    preferences
  }
  
  // Store in localStorage for immediate access
  localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consentData))
  
  // Also store in secure cookie
  const isProduction = window.location.protocol === 'https:'
  const cookieOptions = [
    `${CONSENT_COOKIE_NAME}=${JSON.stringify(consentData)}`,
    'Path=/',
    'Max-Age=31536000', // 1 year
    'SameSite=Strict',
    isProduction ? 'Secure' : ''
  ].filter(Boolean)
  
  document.cookie = cookieOptions.join('; ')
}

function loadConsentPreferences(): ConsentData | null {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(CONSENT_COOKIE_NAME)
    if (stored) {
      const data = JSON.parse(stored) as ConsentData
      // Check if consent is still valid (not older than 1 year)
      if (data.timestamp > Date.now() - 31536000000) {
        return data
      }
    }
    
    // Fallback to cookie
    const cookieMatch = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`))
    
    if (cookieMatch) {
      const data = JSON.parse(cookieMatch.split('=')[1]) as ConsentData
      if (data.timestamp > Date.now() - 31536000000) {
        return data
      }
    }
  } catch (error) {
    console.error('Failed to load consent preferences:', error)
  }
  
  return null
}

// Initialize analytics based on consent
function initializeAnalytics(preferences: ConsentPreferences) {
  if (preferences.analytics) {
    // Initialize Google Analytics or other analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: preferences.marketing ? 'granted' : 'denied'
      })
    }
    
    console.log('Analytics enabled')
  } else {
    // Disable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      })
    }
    console.log('Analytics disabled')
  }
}

interface ConsentBannerProps {
  onConsentGiven: (preferences: ConsentPreferences) => void
}

export default function ConsentBanner({ onConsentGiven }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    // Check if consent has already been given
    const existingConsent = loadConsentPreferences()
    
    if (!existingConsent) {
      // Show banner if no consent given
      setIsVisible(true)
    } else {
      // Apply existing preferences
      setPreferences(existingConsent.preferences)
      onConsentGiven(existingConsent.preferences)
      initializeAnalytics(existingConsent.preferences)
    }
  }, [onConsentGiven])

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    
    saveConsentPreferences(allAccepted)
    setPreferences(allAccepted)
    onConsentGiven(allAccepted)
    initializeAnalytics(allAccepted)
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    saveConsentPreferences(preferences)
    onConsentGiven(preferences)
    initializeAnalytics(preferences)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    
    saveConsentPreferences(onlyNecessary)
    setPreferences(onlyNecessary)
    onConsentGiven(onlyNecessary)
    initializeAnalytics(onlyNecessary)
    setIsVisible(false)
  }

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === 'necessary') return // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Cookie Consent & Privacy
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your experience, analyze site traffic, and provide personalized content.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showDetails && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Necessary Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Essential for site functionality, security, and user authentication.
                    </p>
                  </div>
                  <Checkbox 
                    checked={true} 
                    disabled={true}
                    className="cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help us understand how visitors interact with our site.
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference('analytics', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Used for targeted advertising and social media integration.
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => updatePreference('marketing', checked as boolean)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Functional Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable enhanced features and personalization.
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => updatePreference('functional', checked as boolean)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-0">
          {!showDetails ? (
            <div className="flex flex-wrap gap-2 w-full">
              <Button 
                onClick={handleAcceptAll}
                className="flex-1 min-w-[120px]"
              >
                Accept All
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRejectAll}
                className="flex-1 min-w-[120px]"
              >
                Reject All
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowDetails(true)}
                className="flex-1 min-w-[120px]"
              >
                Customize
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 w-full">
              <Button 
                onClick={handleAcceptSelected}
                className="flex-1 min-w-[150px]"
              >
                Save Preferences
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(false)}
                className="flex-1 min-w-[100px]"
              >
                Back
              </Button>
            </div>
          )}
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By continuing to use our site, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

// Hook to check consent status
export function useConsentStatus(): [ConsentPreferences | null, (preferences: ConsentPreferences) => void] {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null)

  useEffect(() => {
    const existing = loadConsentPreferences()
    if (existing) {
      setConsent(existing.preferences)
    }
  }, [])

  const updateConsent = (preferences: ConsentPreferences) => {
    setConsent(preferences)
    saveConsentPreferences(preferences)
    initializeAnalytics(preferences)
  }

  return [consent, updateConsent]
}

// Export utilities for other components
export { saveConsentPreferences, loadConsentPreferences, initializeAnalytics }
export type { ConsentPreferences, ConsentData }