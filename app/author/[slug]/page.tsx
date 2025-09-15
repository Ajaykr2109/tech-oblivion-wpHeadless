import { redirect } from 'next/navigation'

interface AuthorPageProps { params: Promise<{ slug: string }> }

// Legacy /author/[slug] route: permanently redirect to new canonical /profile/[slug]
export default async function LegacyAuthorRedirect({ params }: AuthorPageProps) {
  const { slug } = await params
  redirect(`/profile/${encodeURIComponent(slug)}`)
}

export async function generateMetadata() {
  return { title: 'Redirecting…' }
}
