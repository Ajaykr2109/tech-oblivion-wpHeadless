import { Metadata } from 'next'

import AutoAnalyticsDashboard from '@/components/analytics/AutoAnalyticsDashboard'

export const metadata: Metadata = {
  title: 'Auto Analytics Dashboard - Admin',
  description: 'Comprehensive analytics dashboard with real-time metrics'
}

export default function AutoAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AutoAnalyticsDashboard />
    </div>
  )
}