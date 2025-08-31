
import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardClientShell from '@/components/dashboard/DashboardClientShell'

export default async function DashboardPage() {
  // Dummy user data for design purposes, replacing the authentication check.
  const user = {
    displayName: "Jane Doe",
    username: "janedoe",
    email: "jane.doe@example.com",
    id: "12345",
    roles: ["subscriber", "editor"],
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.displayName}!</p>
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
              <p>{user.displayName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p>{user.username}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p>{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Roles</p>
              <p className="capitalize">{(user.roles || []).join(', ') || 'Subscriber'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button asChild>
            <Link href="/">Back to Home</Link>
        </Button>
        <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="destructive">
            Logout
            </Button>
        </form>
      </div>

      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold">Unified Dashboard</h2>
  <DashboardClientShell />
      </div>
    </div>
  )
}
