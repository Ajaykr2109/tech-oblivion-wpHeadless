"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Edit, Share2, MoreVertical, Clipboard } from 'lucide-react'
import { RoleGate } from '@/hooks/useRoleGate'
import { useToast } from '@/hooks/use-toast'

type Props = {
  postId: number
  slug: string
  title: string
}

export default function PostActions({ postId, slug, title }: Props) {
  const { toast } = useToast()
  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : `${slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Link copied', description: 'Post URL copied to clipboard.' })
      // Fallback: no-op
    } catch {}
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Post actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
  <RoleGate action="admin" as="div">
          <DropdownMenuItem asChild>
            <Link href={`/editor/${postId}`} className="cursor-pointer">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
        </RoleGate>
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="h-4 w-4" />
          <span>Share...</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            const url = typeof window !== 'undefined' ? window.location.href : `${slug}`
            try { await navigator.clipboard.writeText(url); toast({ title: 'Link copied' }) } catch {}
          }}
          className="cursor-pointer"
        >
          <Clipboard className="h-4 w-4" />
          <span>Copy link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
