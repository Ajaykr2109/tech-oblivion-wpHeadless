import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/dashboard')
  const allowed = Array.isArray(user.roles) && user.roles.some(r => (
    ['subscriber','contributor','author','editor','administrator'] as const
  ).includes(r as any))
  if (!allowed) redirect('/')
  return <>{children}</>
}
