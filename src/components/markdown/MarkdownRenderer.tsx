"use client"

import React from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'

type Props = {
  markdown: string
  className?: string
}

export default function MarkdownRenderer({ markdown, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        // Allow HTML embedded in markdown safely handled by rehype-raw + downstream sanitizers/styles
        rehypePlugins={[
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rehypeRaw as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rehypeSlug as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [rehypeAutolinkHeadings as any, { behavior: 'wrap' }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rehypeHighlight as any,
        ]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remarkPlugins={[remarkGfm as any]}
        // Limit image width and add lazy loading via components mapping
        components={{
          img: (props) => props.src ? <Image src={props.src} alt={props.alt || ''} width={800} height={600} unoptimized /> : null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: (codeProps: any) => {
            const { inline, className, children, ...props } = codeProps || {}
            const child = String(children || '')
            if (inline) return <code className={className} {...props}>{child}</code>
            return (
              <pre className="group relative">
                <code className={className} {...props}>{child}</code>
                <button
                  type="button"
                  className="absolute right-2 top-2 hidden rounded bg-muted px-2 py-1 text-xs text-foreground group-hover:block"
                  onClick={() => navigator.clipboard?.writeText(child).catch(() => {})}
                  aria-label="Copy code"
               >
                  Copy
                </button>
              </pre>
            )
          }
        }}
      >
        {markdown || ''}
      </ReactMarkdown>
    </div>
  )
}
