'use client'

import React from 'react'

import { Slider } from '@/components/ui/slider'

type Props = {
  value: number
  onChange: (v: number) => void
}

export function ZoomSlider({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 w-40">
      <span className="text-xs text-muted-foreground w-8 text-right">{value}%</span>
      <Slider defaultValue={[value]} value={[value]} onValueChange={(v)=>onChange(v[0])} min={80} max={160} step={5} />
    </div>
  )
}
