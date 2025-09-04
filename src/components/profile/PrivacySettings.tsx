"use client"

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PrivacySettingsProps {
  initialSettings?: {
    showBookmarksPublic?: boolean
  }
  onUpdate?: (settings: { showBookmarksPublic: boolean }) => void
}

export function PrivacySettings({ initialSettings, onUpdate }: PrivacySettingsProps) {
  const [showBookmarksPublic, setShowBookmarksPublic] = useState(
    initialSettings?.showBookmarksPublic || false
  )

  const handleBookmarksToggle = (enabled: boolean) => {
    setShowBookmarksPublic(enabled)
    onUpdate?.({ showBookmarksPublic: enabled })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control what information is visible on your public profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-bookmarks" className="text-base">
              Show My Bookmarks
            </Label>
            <p className="text-sm text-muted-foreground">
              Display your bookmarks collection on your public profile page
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showBookmarksPublic ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              id="show-bookmarks"
              checked={showBookmarksPublic}
              onCheckedChange={handleBookmarksToggle}
            />
          </div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> When enabled, visitors to your profile will be able to see 
            your bookmarked articles. Your private bookmarks and personal notes will never be shown.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
