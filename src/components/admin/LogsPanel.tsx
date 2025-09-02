'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuthLog {
  ts: string
  level: string
  context: string
  data: {
    userId: string | number
    role: string
    action: string
    status: 'allowed' | 'denied'
    details?: Record<string, unknown>
    timestamp: string
  }
}

export default function LogsPanel() {
  const [logs, setLogs] = useState<AuthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    if (filterRole !== 'all' && !log.data.role.includes(filterRole)) return false
    if (filterAction !== 'all' && !log.data.action.includes(filterAction)) return false
    if (filterStatus !== 'all' && log.data.status !== filterStatus) return false
    return true
  })

  const uniqueRoles = Array.from(new Set(logs.map(log => log.data.role).filter(Boolean)))
  const uniqueActions = Array.from(new Set(logs.map(log => log.data.action).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Authorization Logs</h2>
        <Button onClick={fetchLogs} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {uniqueRoles.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="allowed">Allowed</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        {loading ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No logs found</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <Badge variant={log.data.status === 'allowed' ? 'default' : 'destructive'}>
                    {log.data.status}
                  </Badge>
                  <span className="font-medium">{log.data.action}</span>
                  <span className="text-sm text-muted-foreground">by {log.data.userId}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{log.data.role}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.ts).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
