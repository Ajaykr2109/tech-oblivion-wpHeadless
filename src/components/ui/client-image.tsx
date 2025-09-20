"use client"
import Image, { ImageProps } from 'next/image'
import { useMemo, useState } from 'react'

type ClientImageProps = ImageProps & {
  fallbackSrc?: string
}

const DEFAULT_BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBA6m+Vb8AAAAASUVORK5CYII='

export default function ClientImage({ fallbackSrc = '/favicon.ico', placeholder = 'blur', blurDataURL, ...rest }: ClientImageProps) {
  const [failed, setFailed] = useState(false)
  const [localSrc] = useState<string | null>(null)
  const blur = useMemo(() => blurDataURL || DEFAULT_BLUR, [blurDataURL])
  const initialSrc = (rest.src as string)

  // Simplified: don't attempt client-side caching; rely on direct URLs.
  // Rewrite techoblivion.in media URLs through local proxy to bypass hotlink protection
  const maybeProxied = useMemo(() => {
    try {
      const u = new URL(String(initialSrc))
      const host = u.hostname.replace(/^www\./, '')
      if (host === 'techoblivion.in') {
        return `/api/wp/media${u.pathname}`
      }
      // Jetpack CDN might serve from i*.wp.com/techoblivion.in/... — allow as-is
      return initialSrc
    } catch {
      return initialSrc
    }
  }, [initialSrc])

  const src = failed ? fallbackSrc : (localSrc || maybeProxied)
  const unoptimized = process.env.NODE_ENV !== 'production'
  return (
    <Image
      {...rest}
      src={src}
      placeholder={placeholder}
      blurDataURL={blur}
      // Avoid Next image optimizer in dev; many WP hosts block hotlinked optimizer fetches
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
    />
  )
}
