"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { getUsers } from "@/lib/wp";

type AvatarUrls = Record<string, string>;
type ProfileFields = Record<string, unknown> | null | undefined;

type Author = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  avatar_urls?: AvatarUrls;
  profile_fields?: ProfileFields;
};

export default function AuthorsList() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

  async function load() {
      setLoading(true);
      setError(null);
      try {
        const users = await getUsers({ context: "view" });
        const mapped: Author[] = (users || []).map((u) => ({
          id: u.id,
          name: u.name || u.display_name || u.slug || String(u.id),
          slug: u.slug || String(u.id),
          description: u.description || "",
          avatar_urls: u.avatar_urls || {},
          profile_fields: undefined,
        }));
        if (!cancelled) setAuthors(mapped);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load authors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-5/6 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-destructive/10 text-destructive p-6">
        <div className="font-semibold mb-1">Failed to load authors</div>
        <div className="text-sm opacity-80">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {authors.map((a) => {
        const avatar = a.avatar_urls?.["96"] || a.avatar_urls?.["48"] || a.avatar_urls?.["24"] || "";
        return (
          <article key={a.id} className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-4">
              <Image
                src={avatar}
                alt={a.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover border"
                unoptimized
              />
              <div>
                <h3 className="text-lg font-semibold leading-tight">
                  <Link href={`/profile/${encodeURIComponent(a.slug)}`} className="hover:underline">
                    {a.name}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground">@{a.slug}</p>
              </div>
            </div>

            {a.description && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {a.description}
              </p>
            )}

            {a.profile_fields && typeof a.profile_fields === "object" && (
              <div className="mt-4 text-sm">
                <div className="text-muted-foreground mb-2 font-medium">Profile</div>
                <dl className="grid grid-cols-1 gap-2">
                  {Object.entries(a.profile_fields).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="min-w-20 text-muted-foreground capitalize">{k}</dt>
                      <dd className="flex-1 break-words">
                        {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                          ? String(v)
                          : Array.isArray(v)
                          ? v.join(", ")
                          : v === null
                          ? "—"
                          : JSON.stringify(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
