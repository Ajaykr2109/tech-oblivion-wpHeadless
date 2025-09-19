"use client"
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type DebugResult = {
  endpoint: string
  status: number
  contentType: string | null
  isValidJSON: boolean
  isHTML: boolean
  responsePreview: string
  responseLength: number
  hasAuth: boolean
  data: Record<string, unknown> | null
  debugInfo: {
    wpBase: string
    sessionCookieName: string
    requestHeaders: Record<string, string>
  }
  error?: string
  message?: string
}

export default function AnalyticsDebugger() {
  const [results, setResults] = useState<Record<string, DebugResult>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const testEndpoint = async (endpoint: string) => {
    setLoading(endpoint)
    try {
      const response = await fetch(`/api/analytics/debug?endpoint=${endpoint}`)
      const result = await response.json()
      setResults(prev => ({ ...prev, [endpoint]: result }))
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [endpoint]: { 
          error: 'Client fetch failed', 
          message: error instanceof Error ? error.message : 'Unknown error'
        } as DebugResult 
      }))
    } finally {
      setLoading(null)
    }
  }

  const testAllEndpoints = async () => {
    const endpoints = ['summary', 'views', 'check', 'devices', 'countries', 'referers']
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint)
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const endpoints = ['summary', 'views', 'check', 'devices', 'countries', 'referers']

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Endpoints Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={testAllEndpoints} disabled={!!loading}>
              Test All Endpoints
            </Button>
            {endpoints.map(endpoint => (
              <Button
                key={endpoint}
                variant="outline"
                onClick={() => testEndpoint(endpoint)}
                disabled={loading === endpoint}
              >
                {loading === endpoint ? 'Testing...' : endpoint}
              </Button>
            ))}
          </div>
          
          {Object.entries(results).map(([endpoint, result]) => (
            <Card key={endpoint} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{endpoint}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={result.status < 300 ? 'default' : 'destructive'}>
                      {result.status || 'Error'}
                    </Badge>
                    <Badge variant={result.isValidJSON ? 'default' : 'destructive'}>
                      {result.isValidJSON ? 'Valid JSON' : 'Invalid JSON'}
                    </Badge>
                    {result.isHTML && (
                      <Badge variant="destructive">HTML Response</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {result.error ? (
                  <div className="text-red-600">
                    <p><strong>Error:</strong> {result.error}</p>
                    <p><strong>Message:</strong> {result.message}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Endpoint:</strong> {result.endpoint}</div>
                      <div><strong>Status:</strong> {result.status}</div>
                      <div><strong>Content-Type:</strong> {result.contentType || 'Not set'}</div>
                      <div><strong>Response Size:</strong> {result.responseLength} bytes</div>
                      <div><strong>Has Auth:</strong> {result.hasAuth ? 'Yes' : 'No'}</div>
                      <div><strong>WP Base:</strong> {result.debugInfo?.wpBase}</div>
                    </div>
                    
                    {result.responsePreview && (
                      <div>
                        <strong>Response Preview:</strong>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                          {result.responsePreview}
                        </pre>
                      </div>
                    )}
                    
                    {result.data && result.isValidJSON && (
                      <div>
                        <strong>Parsed Data:</strong>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {result.debugInfo && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">Debug Info</summary>
                        <pre className="bg-gray-50 p-2 rounded mt-2">
                          {JSON.stringify(result.debugInfo, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}