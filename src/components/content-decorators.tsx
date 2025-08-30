"use client"
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ContentDecorators({ selector = '.wp-content' }: { selector?: string }) {
  const { toast } = useToast()
  useEffect(() => {
    const root = document.querySelector(selector)
    if (!root) return
    let lastToast = 0
    const canToast = () => {
      const now = Date.now()
      if (now - lastToast < 1200) return false
      lastToast = now
      return true
    }

    // Decorate headings with anchor link buttons + subtle transition
    root.querySelectorAll('h2[id], h3[id]').forEach((h) => {
      const el = h as HTMLElement
      if (el.querySelector('.para-anchor')) return
      el.classList.add('group','transition-colors','duration-200')
      const btn = document.createElement('button')
      btn.className = 'para-anchor opacity-0 group-hover:opacity-100 ml-2 text-xs text-muted-foreground hover:text-foreground'
      btn.title = 'Copy link to this section'
      btn.innerHTML = '<svg class="inline h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 1 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
      btn.addEventListener('click', () => {
        const url = new URL(window.location.href)
        url.hash = `#${el.id}`
        navigator.clipboard.writeText(url.toString())
  if (canToast()) toast({ title: 'Link copied', description: 'Section URL copied to clipboard.' })
      })
      const span = document.createElement('span')
      span.className = 'group'
      while (el.firstChild) span.appendChild(el.firstChild)
      el.appendChild(span)
      el.appendChild(btn)
    })

    // Add copy button to code blocks
    root.querySelectorAll('pre').forEach((pre) => {
      const el = pre as HTMLElement
      if (el.querySelector('.code-copy')) return
      const btn = document.createElement('button')
      btn.className = 'code-copy absolute top-2 right-2 rounded bg-black/40 text-white px-2 py-1 text-xs hover:bg-black/60'
      btn.textContent = 'Copy'
      btn.addEventListener('click', () => {
        const code = el.querySelector('code')
        const text = code?.textContent || ''
        navigator.clipboard.writeText(text)
  if (canToast()) toast({ title: 'Code copied' })
      })
      el.style.position = 'relative'
      el.appendChild(btn)

      // Add language label if available from code class
      const codeEl = el.querySelector('code') as HTMLElement | null
      const klass = codeEl?.className || ''
      let lang = ''
      const m = klass.match(/language-([a-z0-9_+-]+)/i)
      if (m) lang = m[1]
      if (lang && !el.querySelector('.code-lang')) {
        const badge = document.createElement('span')
        badge.className = 'code-lang absolute top-2 left-2 rounded bg-black/30 text-white/90 px-2 py-0.5 text-[10px] uppercase tracking-wide'
        badge.textContent = lang
        el.appendChild(badge)
      }
    })

    // Add share/copy for blockquotes
    root.querySelectorAll('blockquote').forEach((bq) => {
      const el = bq as HTMLElement
      if (el.querySelector('.quote-copy')) return
      const wrap = document.createElement('div')
      wrap.className = 'relative'
      el.parentElement?.insertBefore(wrap, el)
      wrap.appendChild(el)
      const btn = document.createElement('button')
      btn.className = 'quote-copy absolute top-2 right-2 rounded bg-primary text-primary-foreground px-2 py-1 text-xs hover:bg-primary/90'
      btn.textContent = 'Share'
      btn.addEventListener('click', () => {
        const text = el.textContent?.trim() || ''
        const url = new URL(window.location.href)
        navigator.clipboard.writeText(`${text}\n\n${url.toString()}`)
  if (canToast()) toast({ title: 'Quote copied', description: 'Quote + link copied to clipboard.' })
      })
      wrap.appendChild(btn)
    })

    // Highlight active heading within content (mirror TOC)
    const headings = Array.from(root.querySelectorAll('h2[id], h3[id]')) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.classList.add('heading-active')
          } else {
            el.classList.remove('heading-active')
          }
        })
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 1] }
    )
    headings.forEach((h) => observer.observe(h))

    // Style internal vs external links inside content (no underline, subtle hover)
    root.querySelectorAll('a[href]').forEach((a) => {
      const el = a as HTMLAnchorElement
      const href = el.getAttribute('href') || ''
      el.classList.add('no-underline','hover:underline','transition-colors')
      try {
        const u = new URL(href, window.location.origin)
        const isExternal = u.origin !== window.location.origin
        if (isExternal) {
          el.classList.add('text-primary')
          el.setAttribute('target','_blank')
          el.setAttribute('rel','noopener noreferrer')
        } else {
          el.classList.add('text-foreground')
        }
      } catch {
        // Leave relative hash/mailto etc with basic style
        el.classList.add('text-foreground')
      }
    })

    return () => { observer.disconnect() }
  }, [selector])

  return null
}
