"use client"
import { useEffect, useRef, useState } from 'react'

export type SessionsPayload = { sessions: { sessionsNow: number; timestamp: string }; presence: { userId: string; username: string; editingPostId?: number; lastSeen: string }[] }

export function useAnalyticsSSE() {
  const [data, setData] = useState<SessionsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<EventSource | null>(null)

  useEffect(() => {
    let cancelled = false
    try {
      const es = new EventSource('/api/analytics/stream')
      ref.current = es
      es.onmessage = (e) => {
        try {
          const j = JSON.parse(e.data)
          if (!cancelled) setData(j)
        } catch {}
      }
      es.onerror = () => {
        setError('sse_error')
        es.close()
        ref.current = null
      }
    } catch (e: any) {
      setError(e?.message || 'sse_init_failed')
    }
    return () => { cancelled = true; ref.current?.close(); ref.current = null }
  }, [])

  // Fallback polling every 15s
  useEffect(() => {
    if (!error) return
    let timer: any = null
    const tick = async () => {
      try {
        const r = await fetch('/api/metrics', { cache: 'no-store' })
        // app-specific transform could happen here
        if (r.ok) {
          // leave as-is; caller can combine
        }
      } catch {}
    }
    timer = setInterval(tick, 15000)
    return () => { if (timer) clearInterval(timer) }
  }, [error])

  return { data, error }
}
