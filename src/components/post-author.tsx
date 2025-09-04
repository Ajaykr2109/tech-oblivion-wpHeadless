"use client"

import { Twitter, Linkedin, Github, Globe } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AuthorLink } from '@/components/common/AuthorLink'

type PostAuthorProps = {
  authorName?: string
  authorAvatar?: string
  canonicalUrl?: string | null
  bio?: string | null
  profileSlug?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  websiteUrl?: string | null
}

export default function PostAuthor({ 
  authorName, 
  authorAvatar, 
  canonicalUrl: _canonicalUrl, 
  bio, 
  profileSlug, 
  twitterUrl, 
  linkedinUrl, 
  githubUrl,
  websiteUrl
}: PostAuthorProps) {
  const name = authorName || 'Unknown Author'
  const slug = profileSlug || 'unknown'
  const avatar = authorAvatar
  
  // Clean up social URLs and only show if they exist
  const socials = {
    twitter: twitterUrl?.trim(),
    linkedin: linkedinUrl?.trim(), 
    github: githubUrl?.trim(),
    website: websiteUrl?.trim()
  }

  // Get first letter for avatar fallback
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="bg-card/50 p-6 rounded-lg border flex flex-col sm:flex-row items-start gap-6">
      {/* Avatar - make it clickable to go to profile */}
      <AuthorLink name={name} slug={slug} className="block">
        <Avatar className="h-24 w-24 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          <AvatarImage src={avatar || ''} alt={name} />
          <AvatarFallback className="text-2xl font-bold bg-primary/10">
            {initial}
          </AvatarFallback>
        </Avatar>
      </AuthorLink>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-1">WRITTEN BY</h3>
        
        {/* Author name - make it clickable to go to profile */}
        <AuthorLink name={name} slug={slug}>
          <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">
            {name}
          </h2>
        </AuthorLink>
        
        <p className="text-muted-foreground mb-4">
          {bio || 'An avid writer and technologist sharing insights on modern development practices.'}
        </p>
        
        {/* Social links - only show if they exist */}
        {(socials.twitter || socials.linkedin || socials.github || socials.website) && (
          <div className="flex items-center gap-4 mb-4">
            {socials.twitter && (
              <a 
                href={socials.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter" 
                className="text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {socials.linkedin && (
              <a 
                href={socials.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn" 
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {socials.github && (
              <a 
                href={socials.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub" 
                className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {socials.website && (
              <a 
                href={socials.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Website" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {/* View full profile link */}
          <AuthorLink 
            name={name} 
            slug={slug} 
            className="text-sm text-primary hover:underline font-medium"
          >
            View full profile →
          </AuthorLink>
          
          {/* Follow button removed as per requirements */}
        </div>
      </div>
    </div>
  )
}
