import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Twitter, Linkedin, Github, Edit3 } from "lucide-react";
import { decodeEntities } from "@/lib/text";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import AuthorActivity from "@/components/author-activity";
import { getUserBySlug } from "@/lib/wp-public";

export default async function PublicProfilePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;
  const viewingUser = await getSessionUser().catch(() => null)
  const user = await getUserBySlug(username)
  if (!user) notFound();
  const isSelf = !!(viewingUser && String(viewingUser.wpUserId ?? viewingUser.id) === String(user.id))

  // Map WP user fields to UI
  const nameRaw = user.name || username;
  const name = decodeEntities(String(nameRaw));
  const avatar = user.avatar_urls?.['96'] || user.avatar_urls?.['48'] || user.avatar_urls?.['24'] || "https://i.pravatar.cc/150?u=" + username;
  const bio = decodeEntities(String(user.description || ""));
  const pf = (user.profile_fields && typeof user.profile_fields === 'object') ? user.profile_fields as Record<string, unknown> : null
  function getPFString(key: string): string | undefined {
    if (!pf) return undefined
    const v = pf[key]
    if (typeof v === 'string') return v
    return undefined
  }
  function getPFArray(key: string): string[] | undefined {
    if (!pf) return undefined
    const v = pf[key]
    if (Array.isArray(v)) return v.map(String)
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return undefined
  }
  function ensureUrl(u?: string) {
    if (!u) return undefined
    const s = u.trim()
    if (!s) return undefined
    if (/^https?:\/\//i.test(s)) return s
    return `https://${s}`
  }
  const social = {
    twitter: ensureUrl(getPFString('twitter') || getPFString('x') || getPFString('twitter_url')),
    linkedin: ensureUrl(getPFString('linkedin') || getPFString('linkedin_url')),
    github: ensureUrl(getPFString('github') || getPFString('github_url')),
  }
  const rolesList = getPFArray('roles') || getPFArray('role') || getPFArray('roles_display')
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
          {rolesList && rolesList.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{rolesList.join(', ')}</p>
          )}
          <p className="text-muted-foreground">@{username}</p>
          <p className="mt-4 text-muted-foreground max-w-lg">{bio}</p>
          <div className="flex items-center gap-6 mt-4 justify-center md:justify-start">
            {isSelf && (
              <Button asChild>
                <Link href="/account"><Edit3 className="mr-2 h-4 w-4" /> Edit profile</Link>
              </Button>
            )}
            <div className="flex gap-4">
              {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Twitter"><Twitter /></a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="LinkedIn"><Linkedin /></a>}
              {social.github && <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="GitHub"><Github /></a>}
            </div>
          </div>
        </div>
      </div>
      {(() => {
        const entries = Object.entries(user.profile_fields ?? {}).filter(([_, v]) => {
          if (v === null || v === undefined) return false
          if (typeof v === 'string') return v.trim().length > 0
          if (Array.isArray(v)) return v.length > 0
          if (typeof v === 'object') return Object.keys(v as any).length > 0
          return true
        })
        if (entries.length === 0) return null
        return (
        <div className="rounded-lg border bg-card/50 p-6 mb-8">
          <div className="text-muted-foreground mb-3 font-medium">Profile</div>
          <dl className="grid grid-cols-1 gap-2">
            {entries.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm">
                <dt className="min-w-20 text-muted-foreground capitalize">{k}</dt>
                <dd className="flex-1 break-words">
                  {typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                    ? String(v)
                    : Array.isArray(v)
                    ? v.join(', ')
                    : v === null
                    ? '—'
                    : JSON.stringify(v)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        )
      })()}
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