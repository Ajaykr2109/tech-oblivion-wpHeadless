"use client"
import { useRoleGate } from '@/hooks/useRoleGate'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

import ModerationPanel from './moderation/ModerationPanel'
import SettingsPanel from './settings/SettingsPanel'
import LogsPanel from './LogsPanel'

export default function UnifiedAdmin() {
  const { allowed, loading } = useRoleGate('admin')
  if (loading) return <div>Loading…</div>
  if (!allowed) return <div className="text-sm text-muted-foreground">You don’t have access to the Admin Dashboard.</div>
  return (
    <Card className="p-4">
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
        <TabsContent value="moderation">
          <ModerationPanel />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
        <TabsContent value="logs">
          <LogsPanel />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
