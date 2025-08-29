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

  const src = failed ? fallbackSrc : (localSrc || initialSrc)
  return (
    <Image
      {...rest}
      src={src}
      placeholder={placeholder}
      blurDataURL={blur}
      onError={() => setFailed(true)}
    />
  )
}
