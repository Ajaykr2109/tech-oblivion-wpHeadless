"use client"

import { useMemo, useState } from 'react'
import { MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'

interface WPUser {
  id: number
  name: string
  email?: string
  avatar_urls?: { [k: string]: string }
  roles?: string[]
  profile_fields?: { [k: string]: unknown } | null
  status?: 'active' | 'inactive'
}

type UserAction = 'delete' | 'activate' | 'deactivate' | 'promote_editor' | 'promote_author' | 'demote_subscriber'

export default function UsersClient() {
  const [selected, setSelected] = useState<number[]>([])
  
  const { data: users, isLoading } = useQuery<WPUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch('/api/wp/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    }
  })
  
  const header = useMemo(()=>['User','Role','Status','Actions'],[])
  const rows = useMemo(()=> (users || []).map(u => ({
    id: u.id,
    cells: [
      <div className="flex items-center gap-3" key="user">
        <Avatar>
          <AvatarImage src={u.avatar_urls?.['96'] || u.avatar_urls?.['48']} alt={u.name} />
          <AvatarFallback>{u.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{u.name}</p>
          {u.email && <p className="text-sm text-muted-foreground">{u.email}</p>}
        </div>
      </div>,
      <Badge variant="outline" key="role">{u.roles?.[0] || 'subscriber'}</Badge>,
      (() => {
        let effective: 'active' | 'inactive' = 'active'
        if (u.status === 'inactive') effective = 'inactive'
        else if (u.profile_fields && typeof u.profile_fields === 'object') {
          const sv = (u.profile_fields as Record<string, unknown>).status
          if (typeof sv === 'string' && sv === 'inactive') effective = 'inactive'
        }
        return (
          <Badge variant={effective === 'inactive' ? 'secondary' : 'default'} key="status">
            {effective === 'inactive' ? 'Inactive' : 'Active'}
          </Badge>
        )
      })(),
      <div key="actions" className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onActionInternal('activate', [u.id])}>Activate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActionInternal('deactivate', [u.id])}>Deactivate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActionInternal('promote_editor', [u.id])}>Promote to Editor</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActionInternal('promote_author', [u.id])}>Promote to Author</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onActionInternal('demote_subscriber', [u.id])}>Demote to Subscriber</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onClick={() => onActionInternal('delete', [u.id])}>Delete User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ]
  })), [users])

  const onActionInternal = async (action: UserAction, ids: number[]) => {
    if (ids.length === 0) return
    if (action === 'delete') {
      // Prefer bulk endpoint if available, otherwise fall back to per-user DELETE
      const res = await fetch('/api/wp/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      if (!res.ok) {
        // fallback
        await Promise.all(ids.map(id => fetch(`/api/wp/users/${id}`, { method: 'DELETE' })))
      }
      return
    }
    // Map role actions to PATCH change_role and status actions to activate/deactivate
    const mapRole: Record<string, string | undefined> = {
      promote_editor: 'editor',
      promote_author: 'author',
      demote_subscriber: 'subscriber',
    }
    await Promise.all(ids.map(async (id) => {
      if (action === 'activate' || action === 'deactivate') {
        await fetch(`/api/wp/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        })
      } else if (mapRole[action]) {
        await fetch(`/api/wp/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'change_role', newRole: mapRole[action] })
        })
      }
    }))
  }

  const onAction = async (action: BulkAction) => {
    if (selected.length === 0) return
    const mapBulk: Record<BulkAction, UserAction> = {
      approve: 'activate',
      disapprove: 'deactivate',
      spam: 'demote_subscriber',
      delete: 'delete',
    }
    await onActionInternal(mapBulk[action], selected)
  }

  if (isLoading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Button><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({users?.length || 0})</CardTitle>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search users by name or email..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <BulkActionsBar onAction={onAction} disabled={selected.length===0} />
          <SelectableTable rows={rows} header={header} onSelectionChange={setSelected} />
        </CardContent>
      </Card>
    </div>
  )
}
