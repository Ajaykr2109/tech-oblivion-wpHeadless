"use client"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type Metric = {
  id: number
  name: string
  formula: string
  chart_type: 'line' | 'bar' | 'area' | string
  pinned?: boolean
  status?: 'ok' | 'error' | string
}

export type MetricEval = {
  status: 'ok' | 'error'
  result?: { current?: number; timeseries?: { date: string; value: number }[] }
  message?: string
}

export type SessionSummary = {
  count: number
  avg_duration: number
  by_device: { device_type: string; count: number }[]
}

export type SessionTS = { date: string; sessions: number; avg_duration: number }

type PresenceEvent = { user: { id: number | string; name?: string; device?: string } }
type StreamEvent =
  | { event: 'session_start'; user_id: number; page: string }
  | { event: 'session_end'; user_id: number; duration: number }
  | { event: 'presence'; user: PresenceEvent['user'] }

type Ctx = {
  metrics: Metric[]
  refreshMetrics: () => Promise<void>
  evals: Record<number, MetricEval>
  evalMetric: (id: number) => Promise<void>
  sessionSummary: SessionSummary | null
  sessionTS: SessionTS[]
  presences: PresenceEvent['user'][]
  error?: string
}

const MetricsCtx = createContext<Ctx | undefined>(undefined)

export function useMetrics() {
  const v = useContext(MetricsCtx)
  if (!v) throw new Error('useMetrics must be used within MetricsProvider')
  return v
}

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [evals, setEvals] = useState<Record<number, MetricEval>>({})
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [sessionTS, setSessionTS] = useState<SessionTS[]>([])
  const [presences, setPresences] = useState<PresenceEvent['user'][]>([])
  const [error, setError] = useState<string | undefined>()

  const pollTimer = useRef<number | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  const refreshMetrics = useCallback(async () => {
    try {
      const r = await fetch('/api/metrics', { cache: 'no-store' })
      if (!r.ok) throw new Error('Failed to load metrics')
      const list: Metric[] = await r.json()
      setMetrics(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load metrics')
    }
  }, [])

  const evalMetric = useCallback(async (id: number) => {
    try {
      const r = await fetch(`/api/metrics/${id}/eval`, { cache: 'no-store' })
      if (!r.ok) throw new Error('Eval failed')
      const data: MetricEval = await r.json()
      setEvals((prev) => ({ ...prev, [id]: data }))
    } catch (e: any) {
      setEvals((prev) => ({ ...prev, [id]: { status: 'error', message: e?.message || 'Eval failed' } }))
    }
  }, [])

  const loadSessions = useCallback(async () => {
    try {
      const [sumR, tsR] = await Promise.all([
        fetch('/api/analytics/sessions/summary', { cache: 'no-store' }),
        fetch('/api/analytics/sessions/timeseries', { cache: 'no-store' }),
      ])
      if (sumR.ok) setSessionSummary(await sumR.json())
      if (tsR.ok) setSessionTS(await tsR.json())
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    refreshMetrics()
    loadSessions()
    // poll metrics every 15s
    pollTimer.current = window.setInterval(() => {
      refreshMetrics()
    }, 15_000) as unknown as number
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current)
    }
  }, [refreshMetrics, loadSessions])

  useEffect(() => {
    // SSE for sessions + presence
    try {
      const es = new EventSource('/api/analytics/stream')
      sseRef.current = es
      es.onmessage = (ev) => {
        try {
          const data: StreamEvent = JSON.parse(ev.data)
          if (data.event === 'presence' && data.user) {
            setPresences((prev) => {
              const filtered = prev.filter((p) => String(p.id) !== String(data.user.id))
              return [...filtered, data.user]
            })
          }
          if (data.event === 'session_start' || data.event === 'session_end') {
            // light refresh on events
            loadSessions()
          }
        } catch {}
      }
      es.onerror = () => {
        // Autoreconnect handled by EventSource when reloaded; onerror we can close and retry later
        es.close()
        sseRef.current = null
      }
    } catch {}
    return () => {
      sseRef.current?.close()
      sseRef.current = null
    }
  }, [loadSessions])

  const value = useMemo<Ctx>(() => ({
    metrics,
    refreshMetrics,
    evals,
    evalMetric,
    sessionSummary,
    sessionTS,
    presences,
    error,
  }), [metrics, evals, sessionSummary, sessionTS, presences, error, refreshMetrics, evalMetric])

  return <MetricsCtx.Provider value={value}>{children}</MetricsCtx.Provider>
}
