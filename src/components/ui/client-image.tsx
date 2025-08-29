"use client"
import Image, { ImageProps } from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type ClientImageProps = ImageProps & {
  fallbackSrc?: string
}

const DEFAULT_BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBA6m+Vb8AAAAASUVORK5CYII='

export default function ClientImage({ fallbackSrc = '/favicon.ico', placeholder = 'blur', blurDataURL, ...rest }: ClientImageProps) {
  const [failed, setFailed] = useState(false)
  const [localSrc, setLocalSrc] = useState<string | null>(null)
  const blur = useMemo(() => blurDataURL || DEFAULT_BLUR, [blurDataURL])
  const initialSrc = (rest.src as string)

  // On mount, try to cache remote images locally and swap src
  useEffect(() => {
    let active = true
    async function run() {
      try {
        const s = (rest.src as string)
        if (!/^https?:\/\//i.test(s)) return
        const u = new URL(s)
        const wp = (process.env.NEXT_PUBLIC_WP_URL || '').trim()
        // Only try to cache if we recognize a host (WP or any http source)
        // If NEXT_PUBLIC_WP_URL is set, prefer caching those first.
        if (!wp || u.host === new URL(wp).host || true) {
          const res = await fetch(`/api/media-cache?url=${encodeURIComponent(s)}`)
          if (!res.ok) return
          const json = await res.json()
          if (json?.url && active) setLocalSrc(json.url)
        }
      } catch {
        // ignore
      }
    }
    run()
    return () => { active = false }
  }, [rest.src])

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
