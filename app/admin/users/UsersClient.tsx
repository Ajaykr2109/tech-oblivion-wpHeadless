"use client"

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'

const dummyUsers = [
  { id: 1, name: "Jane Doe", email: "jane.doe@example.com", role: "Administrator", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { id: 2, name: "John Smith", email: "john.smith@example.com", role: "Editor", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
  { id: 3, name: "Emily White", email: "emily.white@example.com", role: "Author", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d" },
  { id: 4, name: "Chris Green", email: "chris.green@example.com", role: "Subscriber", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d" },
];

export default function UsersClient() {
  const [selected, setSelected] = useState<number[]>([])
  const header = useMemo(()=>['User','Role','Actions'],[])
  const rows = useMemo(()=> dummyUsers.map(u => ({
    id: u.id,
    cells: [
      <div className="flex items-center gap-3" key="user">
        <Avatar>
          <AvatarImage src={u.avatar} alt={u.name} />
          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-sm text-muted-foreground">{u.email}</p>
        </div>
      </div>,
      <Badge variant="outline" key="role">{u.role}</Badge>,
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
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Delete User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ]
  })), [])

  const onAction = async (action: BulkAction) => {
    if (action !== 'delete' || selected.length === 0) return
    const res = await fetch('/api/wp/users/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected })
    })
    if (!res.ok) throw new Error('Bulk delete failed')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Button><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
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
