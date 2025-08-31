"use client"
import dynamic from 'next/dynamic'
import React from 'react'

// Load heavy client-only widgets without SSR to avoid window references at build/prerender
const FullDashboard = dynamic(() => import('./FullDashboard'), { ssr: false })
const CrewMan = dynamic(() => import('./CrewMan'), { ssr: false })

export default function DashboardClientShell() {
  return (
    <>
      <FullDashboard />
      <CrewMan />
    </>
  )
}
