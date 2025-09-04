"use client"

import { useEffect, useRef } from 'react'

import { CodeCopyButton } from './CodeCopyButton'

interface CodeBlockProps {
  children: React.ReactNode
  language?: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ 
  children, 
  language, 
  filename,
  showLineNumbers = false,
  className = '' 
}: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const codeText = typeof children === 'string' ? children : extractTextFromChildren(children)

  useEffect(() => {
    if (preRef.current && language) {
      preRef.current.setAttribute('data-language', language)
    }
  }, [language])

  return (
    <div className={`code-block-container ${className}`}>
      {filename && (
        <div className="code-filename">
          <span className="filename">{filename}</span>
        </div>
      )}
      <pre 
        ref={preRef}
        className={`${showLineNumbers ? 'line-numbers' : ''}`}
        data-language={language}
      >
        <code className={language ? `language-${language}` : ''}>
          {children}
        </code>
        <CodeCopyButton code={codeText} />
      </pre>
    </div>
  )
}

// Helper function to extract text content from React children
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    const reactElement = children as { props: { children: React.ReactNode } }
    return extractTextFromChildren(reactElement.props.children)
  }
  
  return ''
}
