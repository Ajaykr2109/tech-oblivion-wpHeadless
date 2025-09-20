import React from 'react'

interface SectionDividerProps {
  label: string
  description?: string
}

export function SectionDivider({ label, description }: SectionDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground font-medium tracking-wide">
          {label}
        </span>
      </div>
      {description && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {description}
        </p>
      )}
    </div>
  )
}