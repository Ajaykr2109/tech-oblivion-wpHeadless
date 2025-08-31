import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const allowed = user.roles?.some(r => ['administrator'].includes(r))
  if (!allowed) redirect('/')
  return <>{children}</>
}
