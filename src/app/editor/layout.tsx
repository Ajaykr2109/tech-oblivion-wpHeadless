import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

export default async function EditorLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/editor')
  const allowed = user.roles?.some(r => ['contributor','author','editor','administrator'].includes(r))
  if (!allowed) {
    // Soft deny to home for now
    redirect('/')
  }
  return <>{children}</>
}
