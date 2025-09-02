"use client"
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function SettingsPanel() {
  const [enableReferers, setEnableReferers] = useState(true)
  const [_threshold, _setThreshold] = useState(10)

  const refreshCache = async () => {
    try {
      const u = new URL('/api/analytics/summary', window.location.origin)
      u.searchParams.set('refresh', 'true')
      await fetch(u)
    } catch {
      // Ignore cache refresh errors - these are non-critical
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4 space-y-3">
        <div className="font-medium">Feature toggles</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Enable referers</span>
          <Switch checked={enableReferers} onCheckedChange={setEnableReferers} />
        </div>
        <div className="text-xs text-muted-foreground">More toggles can be added later.</div>
      </Card>
      <Card className="p-4 space-y-3">
        <div className="font-medium">Cache controls</div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={refreshCache}>Refresh Analytics Cache</Button>
          <span className="text-xs text-muted-foreground">Triggers transient eviction upstream</span>
        </div>
      </Card>
    </div>
  )
}
