"use client"
import { Share2, Bookmark, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'

export default function FloatingActions({ title }: { title: string }) {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const { allowed } = useRoleGate('read')
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url })
      else await navigator.clipboard.writeText(url)
    } catch {}
  }
  function printPage() { try { window.print() } catch {} }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      <Button size="icon" variant="secondary" className="shadow" onClick={share} aria-label="Share">
        <Share2 className="h-4 w-4" />
      </Button>
      <RoleGate action="draft" disabledClassName="opacity-50">
        <Button size="icon" variant="secondary" className="shadow" aria-label="Bookmark" disabled={!allowed}>
          <Bookmark className="h-4 w-4" />
        </Button>
      </RoleGate>
      <Button size="icon" variant="secondary" className="shadow" onClick={printPage} aria-label="Print">
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  )
}
