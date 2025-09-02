declare module 'react-simple-maps' {
  import * as React from 'react'

  // Minimal types to satisfy our usage, avoid 'any'/'object'
  export type GeographyType = {
    id?: string | number
    rsmKey: string
    // allow extra fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }

  export interface ComposableMapProps {
    projectionConfig?: Record<string, unknown>
    children?: React.ReactNode
  }

  export interface GeographiesProps {
    geography: string | Record<string, unknown>
    // Children receives an array of Geography-like objects; allow id to be optional
    children: (props: GeographiesChildrenProps) => React.ReactNode
  }

  export interface GeographiesChildrenProps {
    geographies: GeographyType[]
  }

  export interface GeographyProps {
    geography: GeographyType
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: React.CSSProperties
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
}
