import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardClientShell from '@/components/dashboard/DashboardClientShell'
import { getSessionUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getSessionUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.display_name || 'User'}!</p>
      </div>
      
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p>{user.display_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p>{user.username || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="capitalize">{(user.roles || [])[0] || 'Subscriber'}</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button asChild>
              <Link href="/account">Edit Profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/posts">My Posts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <DashboardClientShell />
    </div>
  )
}