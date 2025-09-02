declare module 'react-grid-layout' {
  import * as React from 'react'
  export type Layout = { i: string; x: number; y: number; w: number; h: number; minW?: number; maxW?: number; minH?: number; maxH?: number; static?: boolean }
  export interface ReactGridLayoutProps {
    className?: string
    width?: number
    cols?: number
    rowHeight?: number
    layout?: Layout[]
    // Not exhaustive; minimal props used in project
    margin?: [number, number]
    containerPadding?: [number, number]
    isDraggable?: boolean
    isResizable?: boolean
    onLayoutChange?: (layout: Layout[]) => void
    children?: React.ReactNode
  }
  export type WidthProviderProps = ReactGridLayoutProps & {
    measureBeforeMount?: boolean
  }
  export function WidthProvider<T extends React.ComponentType<ReactGridLayoutProps>>(component: T): React.ComponentType<WidthProviderProps>
  const Grid: React.FunctionComponent<ReactGridLayoutProps>
  export default Grid
}
