import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Twitter, Linkedin, Github, Edit3 } from "lucide-react";
import { decodeEntities } from "@/lib/text";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import AuthorActivity from "@/components/author-activity";
import { headers } from "next/headers";

function toSlugish(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

async function fetchUser(username: string) {
  try {
  // 1) Prefer internal proxy API (/api/wp/users/[slug]) for better compatibility
  // Build absolute origin from request headers to work on LAN IP/localhost/prod
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || ''
  const proto = hdrs.get('x-forwarded-proto') || 'http'
  const autoOrigin = host ? `${proto}://${host}` : ''
  const origin = (autoOrigin || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const resLocal = await fetch(`${origin}/api/wp/users/${encodeURIComponent(username)}`, { cache: 'no-store', headers: { 'Accept': 'application/json' } as any })
    if (resLocal.ok) {
      const data = await resLocal.json()
      if (data && data.id) return data
    }

    // 2) Fallback to direct WP REST (public access may be restricted)
    const base = (process.env.NEXT_PUBLIC_WP_URL || process.env.WP_URL || '').replace(/\/$/, '')
    if (!base || !/^https?:\/\//i.test(base)) return null
    const candidate = toSlugish(username)

    const urlBySlug = `${base}/wp-json/wp/v2/users?slug=${encodeURIComponent(candidate)}`
    const resSlug = await fetch(urlBySlug, { next: { revalidate: 300 } })
    if (resSlug.ok) {
      const users = await resSlug.json()
      if (Array.isArray(users) && users.length > 0) return users[0]
    }

    const urlSearch = `${base}/wp-json/wp/v2/users?search=${encodeURIComponent(username)}`
    const resSearch = await fetch(urlSearch, { next: { revalidate: 300 } })
    if (!resSearch.ok) return null
    const list = await resSearch.json()
    if (!Array.isArray(list) || list.length === 0) return null
    const lower = username.toLowerCase()
    const exact = list.find((u: any) => u?.slug?.toLowerCase() === candidate || u?.slug?.toLowerCase() === lower)
    if (exact) return exact
    const byName = list.find((u: any) => u?.name?.toLowerCase() === lower || u?.display_name?.toLowerCase() === lower)
    return byName || list[0] || null
  } catch {
    return null;
  }
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const viewingUser = await getSessionUser().catch(() => null)
  const user = await fetchUser(username);
  if (!user) notFound();
  const isSelf = !!(viewingUser && String(viewingUser.wpUserId ?? viewingUser.id) === String(user.id))

  // Map WP user fields to UI
  const nameRaw = user.name || user.display_name || username;
  const name = decodeEntities(String(nameRaw));
  const avatar = user.avatar_urls?.['96'] || user.avatar || "https://i.pravatar.cc/150?u=" + username;
  const bio = decodeEntities(String(user.description || ""));
  // Activity lists are rendered client-side to allow pagination/loading more

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 bg-card/50 p-8 rounded-lg">
        <Avatar className="h-32 w-32">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-muted-foreground">@{username}</p>
          <p className="mt-4 text-muted-foreground max-w-lg">{bio}</p>
          <div className="flex items-center gap-6 mt-4 justify-center md:justify-start">
            {isSelf ? (
              <Button asChild>
                <Link href="/account"><Edit3 className="mr-2 h-4 w-4" /> Edit profile</Link>
              </Button>
            ) : (
              <Button>Follow</Button>
            )}
            <div className="flex gap-4">
              {/* Social links if available */}
              {user.twitter && <a href={user.twitter} className="text-muted-foreground hover:text-foreground"><Twitter /></a>}
              {user.linkedin && <a href={user.linkedin} className="text-muted-foreground hover:text-foreground"><Linkedin /></a>}
              {user.github && <a href={user.github} className="text-muted-foreground hover:text-foreground"><Github /></a>}
            </div>
          </div>
        </div>
      </div>
  <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <AuthorActivity authorId={Number(user.id)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}