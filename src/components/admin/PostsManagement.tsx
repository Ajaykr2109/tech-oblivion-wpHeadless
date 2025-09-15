'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, Edit, Trash2, FileText, Eye, Star, X, Check 
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface WPPost {
  id: number
  title: { rendered: string }
  status: string
  date: string
  slug: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'publish':
      return <Badge variant="default">Published</Badge>
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'pending':
      return <Badge variant="outline">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function PostsManagement() {
  const [isEditorPicksMode, setIsEditorPicksMode] = useState(false)
  const queryClient = useQueryClient()
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async (): Promise<WPPost[]> => {
      const response = await fetch('/api/wp/posts?per_page=20')
      if (!response.ok) throw new Error('Failed to fetch posts')
      return response.json()
    },
    staleTime: 30000
  })

  // Fetch current editor picks
  const { data: editorPicksData } = useQuery({
    queryKey: ['editor-picks'],
    queryFn: async (): Promise<{ editorPicks: number[] }> => {
      const response = await fetch('/api/admin/editor-picks')
      if (!response.ok) throw new Error('Failed to fetch editor picks')
      return response.json()
    },
    staleTime: 30000
  })

  // Update editor picks mutation
  const updateEditorPicksMutation = useMutation({
    mutationFn: async (editorPicks: number[]) => {
      const response = await fetch('/api/admin/editor-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editorPicks })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update editor picks')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editor-picks'] })
      setIsEditorPicksMode(false)
    }
  })

  const currentEditorPicks = editorPicksData?.editorPicks || []
  
  const toggleEditorPick = (postId: number) => {
    const newPicks = currentEditorPicks.includes(postId)
      ? currentEditorPicks.filter(id => id !== postId)
      : [...currentEditorPicks, postId]
    
    if (newPicks.length <= 6) {
      updateEditorPicksMutation.mutate(newPicks)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Posts Management</h2>
        <div className="flex gap-2">
          <Button
            variant={isEditorPicksMode ? "default" : "outline"}
            onClick={() => setIsEditorPicksMode(!isEditorPicksMode)}
          >
            <Star className="h-4 w-4 mr-2" />
            {isEditorPicksMode ? 'Exit Editor Picks' : 'Manage Editor Picks'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Posts</p>
                <p className="text-2xl font-bold">{posts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-2xl font-bold">
                  {posts?.filter(post => post.status === 'publish').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Drafts</p>
                <p className="text-2xl font-bold">
                  {posts?.filter(post => post.status === 'draft').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Editor Picks</p>
                <p className="text-2xl font-bold">{currentEditorPicks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditorPicksMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Editor Picks Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select up to 6 posts to feature as editor picks on the home page. 
              Click on posts in the table below to toggle their editor pick status.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Current editor picks: {currentEditorPicks.length}/6
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {posts && posts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {isEditorPicksMode && <TableHead>Editor Pick</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const isEditorPick = currentEditorPicks.includes(post.id)
                  return (
                    <TableRow 
                      key={post.id} 
                      className={isEditorPicksMode ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={isEditorPicksMode ? () => toggleEditorPick(post.id) : undefined}
                    >
                      <TableCell className="max-w-[300px]">
                        <div>
                          <p className="font-medium truncate">{post.title.rendered}</p>
                          <p className="text-xs text-muted-foreground truncate">/{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(post.date).toLocaleDateString()}
                      </TableCell>
                      {isEditorPicksMode && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isEditorPick ? (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Featured</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span className="text-xs">Not featured</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>No posts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}