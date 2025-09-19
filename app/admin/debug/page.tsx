import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics Debug - Tech Oblivion',
  description: 'Debug analytics API endpoints',
}

export default function AnalyticsDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">JSON Parse Error Debugging</h2>
          <p className="text-sm text-gray-600 mb-4">
            If you're seeing "Unexpected token '&lt;', '&lt;!DOCTYPE'..." errors, it means WordPress is returning HTML instead of JSON.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium">Quick Tests:</h3>
            <div className="space-y-1 text-sm">
              <div>• Check if WordPress is accessible: <code className="bg-gray-100 px-1 rounded">{process.env.WP_URL || 'WP_URL not configured'}</code></div>
              <div>• Verify analytics MU plugin is active</div>
              <div>• Check database tables exist</div>
              <div>• Test authentication</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-2">Test Analytics Endpoints</h3>
            <div className="space-y-2 text-sm">
              <a href="/api/analytics/debug?endpoint=check" className="block text-blue-600 hover:underline">Test /check endpoint</a>
              <a href="/api/analytics/debug?endpoint=summary" className="block text-blue-600 hover:underline">Test /summary endpoint</a>
              <a href="/api/analytics/debug?endpoint=views" className="block text-blue-600 hover:underline">Test /views endpoint</a>
              <a href="/api/analytics/debug?endpoint=devices" className="block text-blue-600 hover:underline">Test /devices endpoint</a>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-2">Common Issues</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• WordPress returning 404/500 error pages</div>
              <div>• Authentication token missing/invalid</div>
              <div>• MU plugin not loaded</div>
              <div>• Database tables not created</div>
              <div>• Incorrect WP_URL configuration</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">Quick Fix Steps</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Verify WordPress MU plugins are in the correct directory</li>
            <li>Check WordPress error logs</li>
            <li>Test WordPress endpoints directly in browser</li>
            <li>Verify authentication tokens are being passed correctly</li>
            <li>Check database table existence in WordPress admin</li>
          </ol>
        </div>
      </div>
    </div>
  )
}