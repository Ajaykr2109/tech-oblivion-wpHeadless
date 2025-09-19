'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  email_notifications: boolean
  marketing_emails: boolean
  weekly_digest: boolean
  comment_notifications: boolean
  mention_notifications: boolean
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/account/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      } else {
        throw new Error('Failed to fetch preferences')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load preferences',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/account/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Preferences saved successfully'
        })
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading preferences...</div>
  }

  if (!preferences) {
    return <div className="p-6">Failed to load preferences</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Preferences</h1>
        <p className="text-muted-foreground">Customize your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the interface looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                setPreferences({ ...preferences, theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => 
                setPreferences({ ...preferences, language: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via email</p>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, email_notifications: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive promotional content and updates</p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, marketing_emails: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">Get a weekly summary of activity</p>
            </div>
            <Switch
              checked={preferences.weekly_digest}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, weekly_digest: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Comment Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
            </div>
            <Switch
              checked={preferences.comment_notifications}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, comment_notifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchPreferences}>
          Reset
        </Button>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
