'use client'
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Edit, Trash2, Search, MoreHorizontal, Users, 
  UserCheck, UserPlus, Shield, Ban, CheckCircle 
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface WPUser {
  id: number
  name: string
  display_name: string
  slug: string
  email?: string
  roles?: string[]
  avatar_urls?: { [key: string]: string }
  post_count?: number
  description?: string
  status?: 'active' | 'inactive'
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
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

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'administrator':
      return 'destructive'
    case 'editor':
      return 'default'
    case 'author':
      return 'secondary'
    case 'contributor':
      return 'outline'
    default:
      return 'outline'
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'administrator':
      return Shield
    case 'editor':
      return UserCheck
    case 'author':
      return Edit
    default:
      return Users
  }
}

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'subscriber',
    password: ''
  })

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<WPUser[]> => {
      const response = await fetch('/api/wp/users?per_page=100')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
    staleTime: 30000
  })

  // Counts for KPI cards using backend count endpoints
  const { data: totalUsers } = useQuery<number>({
    queryKey: ['users-count-total'],
    queryFn: async () => {
      const res = await fetch('/api/wp/users/count')
      if (!res.ok) throw new Error('Failed to fetch users count')
      const j = await res.json().catch(() => ({})) as { count?: number }
      return typeof j.count === 'number' ? j.count : 0
    },
    staleTime: 30000
  })

  const { data: adminCount } = useQuery<number>({
    queryKey: ['users-count-admin'],
    queryFn: async () => {
      const res = await fetch('/api/wp/users/count?role=administrator')
      if (!res.ok) throw new Error('Failed to fetch admins count')
      const j = await res.json().catch(() => ({})) as { count?: number }
      return typeof j.count === 'number' ? j.count : 0
    },
    staleTime: 30000
  })

  const { data: creatorCount } = useQuery<number>({
    queryKey: ['users-count-creators'],
    queryFn: async () => {
      const res = await fetch('/api/wp/users/count?group=creators')
      if (!res.ok) throw new Error('Failed to fetch creators count')
      const j = await res.json().catch(() => ({})) as { count?: number }
      return typeof j.count === 'number' ? j.count : 0
    },
    staleTime: 30000
  })

  const { data: totalPosts } = useQuery<number>({
    queryKey: ['posts-count-total'],
    queryFn: async () => {
      const res = await fetch('/api/wp/posts/count')
      if (!res.ok) throw new Error('Failed to fetch posts count')
      const j = await res.json().catch(() => ({})) as { count?: number }
      return typeof j.count === 'number' ? j.count : 0
    },
    staleTime: 30000
  })

  const handleUserAction = async (userId: number, action: string, newRole?: string) => {
    try {
      const response = await fetch(`/api/wp/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, newRole })
      })
      if (!response.ok) throw new Error('Failed to update user')
      refetch()
    } catch (error) {
      console.error('User action failed:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/wp/users/${userId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete user')
      refetch()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return
    
    try {
      await Promise.all(selectedUsers.map((id: number) => 
        handleUserAction(id, bulkAction)
      ))
      setSelectedUsers([])
      setBulkAction('')
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/wp/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (!response.ok) throw new Error('Failed to create user')
      setIsAddUserOpen(false)
      setNewUser({ name: '', email: '', role: 'subscriber', password: '' })
      refetch()
    } catch (error) {
      console.error('Add user failed:', error)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!users) return []
    
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRole = selectedRole === 'all' || 
        (user.roles && user.roles.includes(selectedRole))
      
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, selectedRole])

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Failed to load users</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usersByRole = users?.reduce((acc, user) => {
    const role = user.roles?.[0] || 'subscriber'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users Management</h2>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscriber">Subscriber</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddUser}>Create User</Button>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{typeof totalUsers === 'number' ? totalUsers : (filteredUsers?.length || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Administrators</p>
                <p className="text-2xl font-bold">{typeof adminCount === 'number' ? adminCount : (usersByRole.administrator || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Content Creators</p>
                <p className="text-2xl font-bold">
                  {typeof creatorCount === 'number' ? creatorCount : ((usersByRole.editor || 0) + (usersByRole.author || 0) + (usersByRole.contributor || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Posts</p>
                <p className="text-2xl font-bold">{typeof totalPosts === 'number' ? totalPosts : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                  <SelectItem value="promote_editor">Promote to Editor</SelectItem>
                  <SelectItem value="promote_author">Promote to Author</SelectItem>
                  <SelectItem value="demote_subscriber">Demote to Subscriber</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <CardTitle>All Users ({filteredUsers?.length || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const role = user.roles?.[0] || 'subscriber'
                  const RoleIcon = getRoleIcon(role)
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id])
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_urls?.['48']} />
                            <AvatarFallback>
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.display_name || user.name}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(role)} className="flex items-center gap-1 w-fit">
                          <RoleIcon className="h-3 w-3" />
                          {role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.post_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Ban className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
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
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'edit')}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Profile
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'deactivate')}>
                                <Ban className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {role !== 'administrator' && (
                              <>
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'change_role', 'editor')}>
                                  Promote to Editor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'change_role', 'author')}>
                                  Promote to Author
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'change_role', 'subscriber')}>
                                  Demote to Subscriber
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p>No users found</p>
              <Button className="mt-4" onClick={() => setIsAddUserOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}