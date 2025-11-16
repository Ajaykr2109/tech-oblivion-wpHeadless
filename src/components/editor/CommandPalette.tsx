'use client'

import React from 'react'

import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'

type CommandDef = { id: string; title: string }

type Props = {
  open: boolean
  setOpen: (v: boolean) => void
  commands: CommandDef[]
  onRun: (id: string) => void
}

export function CommandPalette({ open, setOpen, commands, onRun }: Props) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Editor">
            {commands.map(c => (
              <CommandItem key={c.id} onSelect={() => { onRun(c.id); setOpen(false) }}>{c.title}</CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
