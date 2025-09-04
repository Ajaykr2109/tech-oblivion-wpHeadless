"use client"

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeCopyButtonProps {
  code: string
  className?: string
}

export function CodeCopyButton({ code, className = '' }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`copy-button ${className}`}
      aria-label={copied ? 'Code copied' : 'Copy code'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          <span className="ml-1">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span className="ml-1">Copy</span>
        </>
      )}
    </button>
  )
}

// Hook to automatically add copy buttons to code blocks
export function useCodeBlockEnhancements() {
  const enhanceCodeBlocks = () => {
    const codeBlocks = document.querySelectorAll('pre:not([data-enhanced])')
    
    codeBlocks.forEach((pre) => {
      const code = pre.querySelector('code')
      if (!code) return
      
      // Mark as enhanced
      pre.setAttribute('data-enhanced', 'true')
      
      // Add language indicator if available
      const className = code.className
      const languageMatch = className.match(/language-(\w+)/)
      if (languageMatch) {
        pre.setAttribute('data-language', languageMatch[1])
      }
      
      // Add copy button container
      const copyContainer = document.createElement('div')
      copyContainer.className = 'copy-button-container'
      
      // Clone the code content for copying
      const codeText = code.textContent || ''
      
      // Create copy button
      const copyButton = document.createElement('button')
      copyButton.className = 'copy-button'
      copyButton.setAttribute('aria-label', 'Copy code')
      copyButton.innerHTML = '<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span class="ml-1">Copy</span>'
      
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeText)
          copyButton.innerHTML = '<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="ml-1">Copied</span>'
          copyButton.setAttribute('aria-label', 'Code copied')
          
          setTimeout(() => {
            copyButton.innerHTML = '<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span class="ml-1">Copy</span>'
            copyButton.setAttribute('aria-label', 'Copy code')
          }, 2000)
        } catch (err) {
          console.error('Failed to copy code:', err)
        }
      })
      
      copyContainer.appendChild(copyButton)
      pre.appendChild(copyContainer)
      
      // Make pre element focusable for accessibility
      pre.setAttribute('tabindex', '0')
    })
  }

  return { enhanceCodeBlocks }
}
