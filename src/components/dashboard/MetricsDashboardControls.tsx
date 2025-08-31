"use client"
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { RoleGate } from '@/hooks/useRoleGate'

export default function MetricsDashboardControls() {
  const [saving, setSaving] = useState(false)
  const run = async (fn: string) => {
    setSaving(true)
    try { await (window as any)[fn]?.() } finally { setSaving(false) }
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run('__saveDashboard')} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      <Button size="sm" variant="secondary" onClick={() => run('__resetDashboard')}>Reset</Button>
      <RoleGate action="admin" as="span"><Button size="sm" variant="outline" onClick={() => run('__setDefaultDashboard')}>Set Default</Button></RoleGate>
    </div>
  )
}
