'use client'

import { useState, useEffect } from 'react'
import { Shield, Monitor } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface SecuritySettings {
  two_factor_enabled: boolean
  login_notifications: boolean
  session_timeout: number
  password_last_changed: string
  active_sessions: Array<{
    id: string
    device: string
    ip_address: string
    last_activity: string
    current: boolean
  }>
  recent_logins: Array<{
    timestamp: string
    ip_address: string
    device: string
    location: string
    success: boolean
  }>
}

export default function SecurityPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/account/security')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityAction = async (action: string, data?: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/account/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Success',
          description: result.message
        })
        fetchSettings() // Refresh settings
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Action failed',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading security settings...</div>
  }

  if (!settings) {
    return <div className="p-6">Failed to load security settings</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Manage your account security and privacy settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settings.two_factor_enabled && (
                <Badge variant="secondary">Enabled</Badge>
              )}
              <Button
                variant={settings.two_factor_enabled ? 'destructive' : 'default'}
                onClick={() => handleSecurityAction(settings.two_factor_enabled ? 'disable_2fa' : 'enable_2fa')}
              >
                {settings.two_factor_enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login & Notifications</CardTitle>
          <CardDescription>Control login behavior and notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
            </div>
            <Switch
              checked={settings.login_notifications}
              onCheckedChange={(checked) => 
                handleSecurityAction('update_settings', { login_notifications: checked })
              }
            />
          </div>
          
          <div>
            <Label>Password Last Changed</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(settings.password_last_changed).toLocaleDateString()}
            </p>
            <Button variant="outline" className="mt-2">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions across devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.active_sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.ip_address} • Last active: {new Date(session.last_activity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.current && <Badge>Current</Badge>}
                  {!session.current && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSecurityAction('terminate_session', { session_id: session.id })}
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
          <CardDescription>Review your recent login attempts and activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.recent_logins.map((login, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${login.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{login.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {login.ip_address} • {login.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(login.timestamp).toLocaleDateString()}</p>
                  <Badge variant={login.success ? 'secondary' : 'destructive'} className="text-xs">
                    {login.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
