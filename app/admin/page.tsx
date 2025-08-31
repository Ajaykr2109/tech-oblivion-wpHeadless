import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

export default function AdminHomePage() {
  redirect('/admin/dashboard')
}
