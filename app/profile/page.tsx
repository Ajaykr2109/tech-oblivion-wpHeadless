
import { redirect } from 'next/navigation'

import { getSessionUser } from '@/lib/auth'

// Public profile index: if a user is logged in, redirect to their public profile slug.
// If not logged in, send them to login (could also show marketing / browse authors later).
export default async function ProfileIndexRedirect() {
  const sessionUser = await getSessionUser().catch(() => null)
  if (!sessionUser) {
    redirect('/login?next=/profile')
  }
  // Attempt to derive a slug/username field
  const slug = (sessionUser as { username?: string; slug?: string; user_nicename?: string }).username 
    || (sessionUser as { slug?: string }).slug 
    || (sessionUser as { user_nicename?: string }).user_nicename 
    || (sessionUser as { id?: string | number }).id
  if (!slug) {
    // Fallback: go to account settings if we cannot infer slug
    redirect('/account/profile')
  }
  redirect(`/profile/${encodeURIComponent(String(slug))}`)
}

    