"use client"

import Link from 'next/link'
import { Calendar, MessageCircle, BookOpen, Globe, Twitter, Linkedin, Github } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface Author {
  id: number
  name: string
  slug: string
  email: string
  description?: string
  avatar_urls?: {
    '96'?: string
  }
  roles?: string[]
  meta?: {
    website?: string
    twitter?: string
    linkedin?: string
    github?: string
    show_bookmarks_public?: boolean
  }
}

interface Post {
  id: number
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  date: string
  slug: string
  link: string
}

interface Comment {
  id: number
  content: {
    rendered: string
  }
  date: string
  post: number
  author_name: string
}

interface AuthorProfileViewProps {
  author: Author
  posts: Post[]
  comments: Comment[]
}

export function AuthorProfileView({ author, posts, comments }: AuthorProfileViewProps) {
  const displayName = author.name || author.slug
  const avatar = author.avatar_urls?.['96']
  const bio = author.description
  const hasAuthorRole = author.roles?.some(role => 
    ['author', 'editor', 'administrator'].includes(role)
  )
  
  // Social links from meta
  const social = {
    website: author.meta?.website,
    twitter: author.meta?.twitter,
    linkedin: author.meta?.linkedin,
    github: author.meta?.github
  }
  
  const showBookmarksPublic = author.meta?.show_bookmarks_public === true

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Author Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback className="text-4xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              
              {author.roles && author.roles.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {author.roles.map(role => (
                    <Badge key={role} variant="secondary" className="capitalize">
                      {role.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              )}
              
              {bio && (
                <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                  {bio}
                </p>
              )}
              
              {/* Social Links */}
              {(social.website || social.twitter || social.linkedin || social.github) && (
                <div className="flex justify-center md:justify-start gap-4 mb-4">
                  {social.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={social.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  {social.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={social.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {social.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {social.github && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={social.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              )}
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                {hasAuthorRole && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{posts.length} Posts</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length} Comments</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue={hasAuthorRole ? "posts" : "comments"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          {hasAuthorRole && (
            <TabsTrigger value="posts">
              <BookOpen className="h-4 w-4 mr-2" />
              Posts ({posts.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="comments">
            <MessageCircle className="h-4 w-4 mr-2" />
            Comments ({comments.length})
          </TabsTrigger>
          {showBookmarksPublic && (
            <TabsTrigger value="bookmarks">
              Bookmarks
            </TabsTrigger>
          )}
        </TabsList>

        {/* Posts Tab */}
        {hasAuthorRole && (
          <TabsContent value="posts" className="space-y-4">
            {posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map(post => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title.rendered}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.date)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {stripHtml(post.excerpt.rendered)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No posts published yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <Card key={comment.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>Comment on Post #{comment.post}</span>
                      <span>•</span>
                      <span>{formatDate(comment.date)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No comments yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bookmarks Tab */}
        {showBookmarksPublic && (
          <TabsContent value="bookmarks" className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Bookmarks feature coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
