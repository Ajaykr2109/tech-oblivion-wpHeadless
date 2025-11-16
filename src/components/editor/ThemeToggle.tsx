'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const [dark, setDark] = React.useState<boolean>(() => typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false)

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
  try { localStorage.setItem('theme', 'dark') } catch { /* persist preference best-effort */ }
    } else {
      document.documentElement.classList.remove('dark')
  try { localStorage.setItem('theme', 'light') } catch { /* persist preference best-effort */ }
    }
  }, [dark])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{dark ? 'Switch to Light' : 'Switch to Dark'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
