"use client"
import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({ 
  title, 
  description, 
  children, 
  defaultOpen = false,
  className 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('space-y-3', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1 -m-1"
      >
        {isOpen ? (
          <ChevronDown size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {title}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="ml-6 space-y-4 transition-all duration-200 ease-in-out">
          {children}
        </div>
      )}
    </div>
  )
}