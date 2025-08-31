"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { RoleGate } from '@/hooks/useRoleGate'

type Endpoint = { method: string; route: string }

export default function CrewMan() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [method, setMethod] = useState('GET')
  const [route, setRoute] = useState('/api/_debug')
  const [headers, setHeaders] = useState('{"Content-Type":"application/json"}')
  const [body, setBody] = useState('{}')
  const [result, setResult] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch('/api/core/endpoints')
        if (r.ok) {
          const list = await r.json()
          setEndpoints(list)
        }
      } catch {}
    }
    run()
  }, [])

  useEffect(() => {
    try { const fav = JSON.parse(localStorage.getItem('crewman:favorites') || '[]'); setFavorites(Array.isArray(fav) ? fav : []) } catch {}
  }, [])

  const methods = useMemo(() => ['GET','POST','PUT','PATCH','DELETE'], [])

  const fire = async () => {
    setSaving(true)
    try {
      const init: RequestInit = { method }
      try { init.headers = JSON.parse(headers || '{}') } catch {}
      if (method !== 'GET' && method !== 'HEAD' && body && body.trim() && init.headers && (init.headers as any)['Content-Type']?.includes('application/json')) {
        init.body = body
      }
      const r = await fetch(route, init)
      const ct = r.headers.get('content-type') || ''
      const text = ct.includes('application/json') ? JSON.stringify(await r.json(), null, 2) : await r.text()
      setResult(text)
    } catch (e: any) {
      setResult(`Error: ${e?.message || 'Request failed'}`)
    } finally { setSaving(false) }
  }

  const saveFav = () => {
    const fav = { method, route, headers, body, at: Date.now() }
    const all = [fav, ...favorites].slice(0, 20)
    setFavorites(all)
    localStorage.setItem('crewman:favorites', JSON.stringify(all))
  }

  return (
    <RoleGate action="admin" as="div">
      <Card className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">CrewMan — API Tester</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveFav} variant="secondary">Save Favorite</Button>
            <Button size="sm" onClick={fire} disabled={saving}>{saving ? 'Sending…' : 'Send'}</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select className="border rounded px-2 py-1" value={method} onChange={(e) => setMethod(e.target.value)}>
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="border rounded px-2 py-1 md:col-span-3" value={route} onChange={(e) => setRoute(e.target.value)}>
            {[route, ...endpoints.map(e => e.route)].filter((v, i, a) => !!v && a.indexOf(v) === i).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Headers (JSON)</div>
            <Textarea value={headers} onChange={(e) => setHeaders(e.target.value)} className="h-28 font-mono text-xs" />
            <div className="text-xs text-muted-foreground">Body</div>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="h-36 font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Response</div>
            <Textarea readOnly value={result} className="h-72 font-mono text-xs" />
          </div>
        </div>
        {favorites.length ? (
          <div>
            <div className="text-xs font-medium mb-1">Favorites</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {favorites.map((f, i) => (
                <Card key={i} className="p-2 text-xs flex items-center justify-between gap-2">
                  <div className="truncate"><span className="text-muted-foreground">{f.method}</span> {f.route}</div>
                  <Button size="sm" variant="secondary" onClick={() => { setMethod(f.method); setRoute(f.route); setHeaders(f.headers); setBody(f.body) }}>Load</Button>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </RoleGate>
  )
}
