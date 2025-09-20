'use client'
import { useState } from 'react'

import PostViewTracker from '@/components/post-view-tracker'
import ViewsCounter from '@/components/views-counter'

export default function TestViewTracking() {
  const [testPostId, setTestPostId] = useState(1)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const testTrackView = async () => {
    try {
      addLog(`Testing track view for post ${testPostId}...`)
      const response = await fetch('/api/wp/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: testPostId }),
      })

      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Track view successful: ${JSON.stringify(data)}`)
      } else {
        const error = await response.text()
        addLog(`❌ Track view failed: ${response.status} ${error}`)
      }
    } catch (error) {
      addLog(`❌ Track view error: ${error}`)
    }
  }

  const testGetViews = async () => {
    try {
      addLog(`Testing get views for post ${testPostId}...`)
      const response = await fetch(`/api/wp/post-views/${testPostId}`)

      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Get views successful: ${JSON.stringify(data)}`)
      } else {
        const error = await response.text()
        addLog(`❌ Get views failed: ${response.status} ${error}`)
      }
    } catch (error) {
      addLog(`❌ Get views error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">View Tracking Test</h1>
      
      <div className="space-y-6">
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="flex items-center gap-4 mb-4">
            <label>
              Post ID:
              <input
                type="number"
                value={testPostId}
                onChange={(e) => setTestPostId(parseInt(e.target.value) || 1)}
                className="ml-2 px-2 py-1 border rounded"
                min="1"
              />
            </label>
            <button
              onClick={testTrackView}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Track View
            </button>
            <button
              onClick={testGetViews}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Get Views
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="text-sm">
            <strong>Current Views Counter:</strong> <ViewsCounter postId={testPostId} />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Auto Tracker Test</h2>
          <p className="text-sm text-muted-foreground mb-2">
            This component will automatically track a view when mounted:
          </p>
          <PostViewTracker postId={testPostId} key={testPostId} />
          <p className="text-xs text-green-600">PostViewTracker mounted for post {testPostId}</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}