"use client"
import Link from 'next/link'
import { Twitter, Linkedin, Github } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type PostAuthorProps = {
  authorName?: string
  authorAvatar?: string
  canonicalUrl?: string | null
  bio?: string | null
  profileSlug?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
}

export default function PostAuthor({ authorName, authorAvatar, canonicalUrl, bio, profileSlug, twitterUrl, linkedinUrl, githubUrl }: PostAuthorProps) {
  const name = authorName || 'Unknown'
  const avatar = authorAvatar || ''
  const canonical = canonicalUrl || '#'

  // Basic heuristic for GitHub profile based on author name, same as inline behavior
  const ghUser = name.replace(/\s+/g, '').toLowerCase()
  const ghHeuristic = name ? `https://github.com/${encodeURIComponent(ghUser)}` : '#'
  const gh = githubUrl || ghHeuristic

  return (
    <div className="bg-card/50 p-6 rounded-lg border flex flex-col sm:flex-row items-start gap-6">
      <Avatar className="h-24 w-24 ring-2 ring-primary/20">
        <AvatarImage src={avatar} alt={name || 'Author'} />
        <AvatarFallback className="text-2xl font-bold">{(name || 'A').charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-1">WRITTEN BY</h3>
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-muted-foreground mb-4">
          {bio || 'An avid writer and technologist sharing insights on modern development practices.'}
        </p>
        {(twitterUrl || linkedinUrl || gh) && (
          <div className="flex items-center gap-4 mb-4">
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-blue-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {gh && (
              <a href={gh} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
        <div className="flex items-center gap-4">
          <Link href={profileSlug ? `/profile/${encodeURIComponent(profileSlug)}` : '/profile'} className="text-sm text-primary hover:underline font-medium">
            View full profile →
          </Link>
          <button className="text-sm bg-primary text-primary-foreground px-4 py-1 rounded-full hover:bg-primary/90 transition-colors">
            + Follow
          </button>
        </div>
      </div>
    </div>
  )
}
