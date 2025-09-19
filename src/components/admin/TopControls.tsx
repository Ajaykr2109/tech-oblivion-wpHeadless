"use client"
import React, { useState } from 'react'
import { Download, Zap, Search as SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  onSearch?: (q: string) => void
  searchPlaceholder?: string
  onExport?: () => void
  onQuickAction?: () => void
}

export default function TopControls({ onSearch, searchPlaceholder = 'Search…', onExport, onQuickAction }: Props) {
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const submitSearch = () => {
    if (onSearch) onSearch(query.trim())
  }

  return (
    <div className="w-full flex items-center justify-end gap-2" aria-label="Global actions toolbar">
      {/* Desktop search */}
      {onSearch && (
        <div className="hidden sm:flex items-center gap-2 max-w-sm w-full">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Global search"
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSearch()
            }}
          />
          <Button variant="secondary" onClick={submitSearch} aria-label="Run search">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Mobile search icon */}
      {onSearch && (
        <Button
          className="sm:hidden"
          size="icon"
          variant="outline"
          aria-label="Open search"
          onClick={() => setMobileSearchOpen(true)}
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      )}

      {/* Export */}
      <Button variant="outline" size="sm" onClick={onExport} aria-label="Export data">
        <Download className="h-4 w-4 mr-2" /> Export Data
      </Button>

      {/* Quick Action */}
      <Button size="sm" onClick={onQuickAction} aria-label="Quick action">
        <Zap className="h-4 w-4 mr-2" /> Quick Action
      </Button>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 sm:hidden">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Global search"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitSearch()
                  setMobileSearchOpen(false)
                }
                if (e.key === 'Escape') setMobileSearchOpen(false)
              }}
            />
            <Button onClick={() => { submitSearch(); setMobileSearchOpen(false) }} aria-label="Run search">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
          <button
            className="absolute inset-0"
            aria-label="Close search overlay"
            onClick={(e) => {
              // Only close when clicking the backdrop (not the input area)
              if ((e.target as HTMLElement).classList.contains('inset-0')) setMobileSearchOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
