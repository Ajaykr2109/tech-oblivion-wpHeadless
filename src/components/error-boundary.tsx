"use client"

import React from 'react'

import { toast } from '@/hooks/use-toast'

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
    toast({
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try refreshing the page.",
      variant: "destructive",
    })
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <div className="text-sm text-destructive">Something went wrong.</div>
    return this.props.children
  }
}
