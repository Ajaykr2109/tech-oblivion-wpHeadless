export interface TocNode {
  id: string
  depth: number
  value: string
  children?: TocNode[]
}

export interface TocControlsState {
  zoom: number // 50-200
  theme: 'light' | 'dark' | 'system'
  mode: 'sticky' | 'floating'
}

// Map of heading id -> estimated minutes to read that section
export type SectionTimeMap = Record<string, number>
