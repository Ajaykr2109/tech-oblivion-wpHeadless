import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";

import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`).replace(/\/$/, "");
  const cookie = hdrs.get('cookie') || ''

  const res = await fetch(`${origin}/api/wp/users/${encodeURIComponent(slug)}`, {
    cache: "no-store",
    headers: { Accept: 'application/json', ...(cookie ? { cookie } : {}) },
  });
  if (!res.ok) return notFound();
  const user = await res.json();

  const me = await getSessionUser().catch(() => null);
  const isSelf = !!(me && String(me.wpUserId ?? me.id) === String(user.id));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4">
        {user.avatar_urls?.["96"] && (
          <Image
            src={user.avatar_urls["96"]}
            alt={user.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full"
            unoptimized
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {isSelf ? (
              <Button size="sm" asChild>
                <Link href="/account">Edit profile</Link>
              </Button>
            ) : null}
          </div>
          <p className="text-muted-foreground">@{user.slug}</p>
        </div>
      </div>
      {user.description && (
        <p className="mt-4 text-sm text-foreground/90">{user.description}</p>
      )}
    </div>
  );
}
