"use client"
import React from 'react'

type Props = { children: React.ReactNode, fallback?: React.ReactNode }

export default class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught', error, info)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <div className="text-sm text-destructive">Something went wrong.</div>
    return this.props.children
  }
}
