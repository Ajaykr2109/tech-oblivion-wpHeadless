
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PageHeader from '@/components/admin/PageHeader'
import { requireAccess } from '@/lib/requireAccess'
import UsersClient from './pageClient'

const dummyUsers = [
  { id: 1, name: "Jane Doe", email: "jane.doe@example.com", role: "Administrator", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { id: 2, name: "John Smith", email: "john.smith@example.com", role: "Editor", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
  { id: 3, name: "Emily White", email: "emily.white@example.com", role: "Author", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d" },
  { id: 4, name: "Chris Green", email: "chris.green@example.com", role: "Subscriber", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d" },
];

export default async function AdminUsersPage() {
  await requireAccess({ path: '/api/wp/users', method: 'GET', action: 'read' })
  return (
    <div className="p-8">
      <PageHeader title="users" subtitle="Update / Delete" />
  <UsersClient />
    </div>
  )
}
