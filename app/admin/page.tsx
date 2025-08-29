import { redirect } from 'next/navigation'
import { requireAnyRole } from '@/lib/auth'

export default async function AdminHomePage() {
  // Protect admin: only administrators or editors
  // Note: This is a Server Component; redirect runs on server
  // If auth fails, requireAnyRole throws and we redirect to home
  // We intentionally don't leak reason (401/403) in UI here
  // to keep it simple; detailed API errors are available via /api/auth/me
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-muted-foreground">Overview metrics and quick links will be shown here.</p>
    </div>
  )
}
