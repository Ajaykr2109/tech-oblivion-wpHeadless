"use client"

import { useState } from 'react'
import { Flag, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CommentActionsProps {
  commentId: number
  onReport?: () => void
}

export default function CommentActions({ commentId, onReport }: CommentActionsProps) {
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const handleReport = async () => {
    setIsReporting(true)
    try {
      const response = await fetch(`/api/wp/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spam' })
      })
      
      if (response.ok) {
        onReport?.()
        setShowReportDialog(false)
      } else {
        console.error('Failed to report comment')
      }
    } catch (error) {
      console.error('Error reporting comment:', error)
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Comment actions</span>
            <Flag className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setShowReportDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report as spam
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Comment as Spam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this comment as spam? This action will mark the comment 
              for moderation and it will be reviewed by site administrators.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReport}
              disabled={isReporting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isReporting ? 'Reporting...' : 'Report Spam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}