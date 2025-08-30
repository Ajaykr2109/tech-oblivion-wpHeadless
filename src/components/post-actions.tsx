"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Edit, Link2, MoreVertical, Share2, Twitter, Linkedin } from "lucide-react"
import { useCallback } from "react"

type PostActionsProps = {
  postId: number
  title?: string
}

export function PostActions({ postId, title }: PostActionsProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {}
  }, [shareUrl])

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title || '')}&url=${encodeURIComponent(shareUrl)}`
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Post actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/editor/${postId}`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copy} className="flex items-center gap-2">
          <Copy className="h-4 w-4" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <Twitter className="h-4 w-4" /> Share to X
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={liUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" /> Share to LinkedIn
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
