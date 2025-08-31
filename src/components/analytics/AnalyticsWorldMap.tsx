"use client"
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import isoCountries from 'i18n-iso-countries'

import { Card } from '@/components/ui/card'

import type { Period, CountryBreakdown } from '../../../types/analytics'

// Register English locale for country mappings if needed
try {
  // @ts-ignore - some typings don't include this
  isoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'))
} catch {}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function AnalyticsWorldMap({ period }: { period: Period }) {
  const { data, isLoading } = useQuery<{ countries?: CountryBreakdown[] }>({
    queryKey: ['analytics', 'summary', period, 'map'],
    queryFn: async () => {
      const u = new URL('/api/analytics/summary', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      if (!r.ok) throw new Error('Failed to load summary')
      return r.json()
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

  const { countsByNumeric, max } = useMemo(() => {
  const list = data?.countries || []
    const map: Record<string, number> = {}
    let max = 0
    for (const c of list) {
      const code = (c.country_code || '').toString().trim()
      let numeric: string | undefined
      if (/^\d+$/.test(code)) {
        // already numeric string, pad to 3
        numeric = code.padStart(3, '0')
      } else if (code.length === 2) {
        const all = isoCountries.getNumericCodes() as Record<string, string>
        const n = all[code.toUpperCase()]
        if (n) numeric = String(n).padStart(3, '0')
      } else if (code.length === 3) {
        // alpha-3 -> numeric
        const alpha2 = isoCountries.alpha3ToAlpha2(code.toUpperCase()) as string | undefined
        if (alpha2) {
          const all = isoCountries.getNumericCodes() as Record<string, string>
          const n = all[alpha2.toUpperCase()]
          if (n) numeric = String(n).padStart(3, '0')
        }
      }
      if (numeric) {
        map[numeric] = (map[numeric] || 0) + (c.count || 0)
        if (map[numeric] > max) max = map[numeric]
      }
    }
    return { countsByNumeric: map, max }
  }, [data])

  const color = useMemo(() => {
    // Tailwind indigo-100 -> indigo-900-ish
    return scaleLinear<string>().domain([0, Math.max(1, max)])
      .range(['#dbeafe', '#1e3a8a'])
  }, [max])

  return (
    <Card className="p-4">
      <div className="font-medium mb-2">World traffic heatmap</div>
      <div className="w-full h-[420px]">
        <ComposableMap projectionConfig={{ scale: 140 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }: any) =>
              geographies.map((geo: any) => {
                const v = countsByNumeric[geo.id as unknown as string] || 0
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={v ? color(v) : '#f1f5f9'}
                    stroke="#ffffff"
                    strokeWidth={0.4}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#60a5fa' }, pressed: { outline: 'none' } }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      {isLoading ? <div className="text-xs text-muted-foreground">Loading…</div> : null}
    </Card>
  )
}
