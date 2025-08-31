"use client"

import { useEffect, useMemo, useRef } from 'react'
import hljs from 'highlight.js'

import sanitizeHtml from 'sanitize-html'
import 'highlight.js/styles/github-dark.css'

export default function PostExcerpt({ html, clampPx }: { html: string; clampPx?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const safe = useMemo(() => {
    return sanitizeHtml(html || '', {
      allowedTags: [],
      allowedAttributes: {},
      allowedSchemesByTag: { a: ['http', 'https', 'mailto'] },
    })
  }, [html])

  useEffect(() => {
    if (!containerRef.current) return
    const blocks = containerRef.current.querySelectorAll('pre code, code')
    blocks.forEach((el) => {
      try {
        hljs.highlightElement(el as HTMLElement)
      } catch (err) {
        // Swallow highlighting errors (e.g., unknown language); keep non-empty
        void err
      }
    })
  }, [safe])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="prose dark:prose-invert max-w-none"
        style={clampPx ? { maxHeight: clampPx, overflow: 'hidden' } : undefined}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      {clampPx ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0), var(--background))',
          }}
        />
      ) : null}
    </div>
  )
}
