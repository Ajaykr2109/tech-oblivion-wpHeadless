declare module 'react-grid-layout' {
  import * as React from 'react'
  export type Layout = { i: string; x: number; y: number; w: number; h: number; minW?: number; maxW?: number; minH?: number; maxH?: number; static?: boolean }
  export interface ReactGridLayoutProps {
    className?: string
    width?: number
    cols?: number
    rowHeight?: number
    layout?: Layout[]
    isDraggable?: boolean
    isResizable?: boolean
    onLayoutChange?: (layout: Layout[]) => void
    children?: React.ReactNode
  }
  const Grid: React.FC<ReactGridLayoutProps>
  export default Grid
}
