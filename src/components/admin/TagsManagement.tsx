'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, Edit, Trash2, Filter, Search, MoreHorizontal, Tag 
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface WPTag {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TagsManagement() {
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async (): Promise<WPTag[]> => {
      const response = await fetch('/api/wp/tags')
      if (!response.ok) throw new Error('Failed to fetch tags')
      return response.json()
    },
    staleTime: 30000
  })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Failed to load tags</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tags Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Tags</p>
                <p className="text-2xl font-bold">{tags?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Most Used</p>
                <p className="text-lg font-semibold">
                  {tags && tags.length > 0 
                    ? tags.reduce((max, tag) => tag.count > max.count ? tag : max, tags[0]).name
                    : '-'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Unused Tags</p>
                <p className="text-2xl font-bold">
                  {tags?.filter(tag => tag.count === 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Avg. Usage</p>
                <p className="text-2xl font-bold">
                  {tags && tags.length > 0 
                    ? Math.round(tags.reduce((sum, tag) => sum + tag.count, 0) / tags.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tags ({tags?.length || 0})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tags..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tags && tags.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        {tag.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {tag.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={tag.count === 0 ? 'secondary' : tag.count > 10 ? 'default' : 'outline'}
                      >
                        {tag.count} posts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Tag className="mx-auto h-12 w-12 mb-4" />
              <p>No tags found</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}